#!/usr/bin/env python3
"""
Extract sentences from local HTML files in folders like 1/, 2/, 3/, 4/, 5/.

Rules implemented per specification:
- Each .desc is a story part. Before every .desc, append a line with ---.
- Sentences are inside elements with class set containing: t0, text_size, simsun.
- <br> tags are treated as hard line breaks.
- Long lines with multiple sentences: split into sentences using ending markers
  and pack sentences into lines of at most 20 characters. The character count
  ignores certain punctuation characters (does not remove them from output),
  specifically: ，、“、” 、？、！、。 、：. If a single sentence is longer than
  20 visible characters (excluding those punctuations), keep it on its own line
  (do not split inside a sentence).
- Ending punctuation markers: ！, ！” , 。, 。” , ？, ？”
- Output is written to the current working directory, filename equals the input
  HTML basename with .txt extension.

Usage:
    python scripts/extract_sentences.py path/to/file.html
"""

from __future__ import annotations

import argparse
import html
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Set


END_MARKERS = (
    "！",
    "！\”",
    "。",
    "。\”",
    "？",
    "？\”",
)

# Regex to capture sentences ending with any of the markers above.
# This finds the shortest run of any characters up to and including a marker.
_SENTENCE_RE = re.compile(rf".+?(?:{'|'.join(map(re.escape, END_MARKERS))})")


def normalize_whitespace(s: str) -> str:
    # Convert non-breaking spaces to regular spaces and strip surrounding whitespace
    s = s.replace("\xa0", " ")
    # Collapse internal runs of whitespace except newlines
    parts = [p.strip() for p in s.split("\n")]
    return "\n".join(p for p in parts if p)


# Punctuation that should be ignored for the purpose of character counting
# when packing sentences into lines. This does NOT affect output content.
# Based on the requirement example: [，““？！。：]
# We also include the right double quote ” to prevent it from dangling.
IGNORED_FOR_COUNT: Set[str] = {
    "，", "“", "”", "？", "！", "。", "：",
}


def visible_len(text: str) -> int:
    """Return length counting only visible (non-ignored) characters.

    This function excludes punctuation in IGNORED_FOR_COUNT from the count,
    while leaving the text itself untouched elsewhere.
    """
    return sum(1 for ch in text if ch not in IGNORED_FOR_COUNT)


def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences using the specified ending markers.

    Any trailing text that does not end with a marker is kept as-is.
    """
    sentences: List[str] = []
    pos = 0
    for m in _SENTENCE_RE.finditer(text):
        sentences.append(m.group(0))
        pos = m.end()
    remainder = text[pos:].strip()
    if remainder:
        sentences.append(remainder)
    return [s.strip() for s in sentences if s.strip()]


def pack_sentences_to_lines(sentences: List[str], max_len: int = 20) -> List[str]:
    """Pack sentences into lines with length <= max_len when possible.

    - Never split inside a sentence.
    - If a sentence length > max_len, put it on its own line.
    - Otherwise, append sentences to the current line separated by nothing
      (Chinese typically does not need a space), as long as the total length
      remains <= max_len. If the next sentence would exceed the limit, start
      a new line.
    """
    out: List[str] = []
    cur = ""
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        if visible_len(s) > max_len:
            if cur:
                out.append(cur)
                cur = ""
            out.append(s)
            continue
        if not cur:
            cur = s
        else:
            if visible_len(cur) + visible_len(s) <= max_len:
                cur += s
            else:
                out.append(cur)
                cur = s
    if cur:
        out.append(cur)
    return out


class StoryHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        # Track div stack to precisely detect entering/leaving a .desc div
        self._div_stack: List[bool] = []  # True marks a .desc div, False otherwise
        self._in_desc: int = 0  # number of active .desc ancestors (0 or 1 expected)
        self._in_t0: int = 0    # nesting level inside a target .t0.text_size.simsun element
        self._t0_class_required: Set[str] = {"t0", "text_size", "simsun"}
        self._buffer: List[str] = []
        self.output_lines: List[str] = []
        self._desc_started: bool = False

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "")
        class_set = set(cls.split()) if cls else set()

        if tag.lower() == "div":
            if ("desc" in class_set):
                # Starting a new .desc block
                self._div_stack.append(True)
                self._in_desc += 1
                if self._in_desc == 1:
                    # Only when entering the outermost .desc
                    self.output_lines.append("---")
                    self._desc_started = True
            else:
                self._div_stack.append(False)

        if self._in_desc > 0 and (self._t0_class_required <= class_set):
            self._in_t0 += 1

        if self._in_t0 > 0 and tag.lower() == "br":
            # explicit line break inside target element
            self._buffer.append("\n")

    def handle_endtag(self, tag: str):
        if self._in_t0 > 0:
            # Only consider closing the target when the t0 div ends.
            if tag.lower() == "div":
                self._in_t0 -= 1
                if self._in_t0 == 0:
                    self._flush_buffer()

        if tag.lower() == "div":
            if self._div_stack:
                was_desc = self._div_stack.pop()
                if was_desc and self._in_desc > 0:
                    self._in_desc -= 1

    def handle_data(self, data: str):
        if self._in_t0 > 0:
            # Normalize HTML entities and whitespace
            text = html.unescape(data)
            self._buffer.append(text)

    def _flush_buffer(self):
        if not self._buffer:
            return
        raw = "".join(self._buffer)
        self._buffer.clear()
        # Normalize whitespace and split on explicit line breaks first
        raw = normalize_whitespace(raw)
        lines = raw.split("\n") if raw else []
        def _merge_dangling_quotes(packed_lines: List[str]) -> List[str]:
            merged: List[str] = []
            for ln in packed_lines:
                if ln == "”":
                    # Attach a standalone closing quote to the previous line if any
                    if merged:
                        merged[-1] = merged[-1] + "”"
                    else:
                        merged.append(ln)
                    continue
                # If a line starts with a closing quote, try to move that quote to the previous line
                if ln.startswith("”") and len(ln) > 1 and merged:
                    merged[-1] = merged[-1] + "”"
                    ln = ln[1:]
                    if not ln:
                        continue
                merged.append(ln)
            return merged
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Split into sentences and pack according to the 20-char rule
            sentences = split_into_sentences(line)
            packed = pack_sentences_to_lines(sentences, max_len=20)
            packed = _merge_dangling_quotes(packed)
            self.output_lines.extend(packed)


def process_file(input_path: Path) -> List[str]:
    parser = StoryHTMLParser()
    with input_path.open("r", encoding="utf-8") as f:
        html_content = f.read()
    parser.feed(html_content)
    parser.close()
    return parser.output_lines


def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser(description="Extract sentences from local HTML files.")
    ap.add_argument("html_file", help="Path to the local HTML file to process")
    args = ap.parse_args(argv)

    in_path = Path(args.html_file)
    if not in_path.exists() or not in_path.is_file():
        print(f"Error: file not found: {in_path}", file=sys.stderr)
        return 1

    try:
        lines = process_file(in_path)
    except Exception as e:
        print(f"Error while processing {in_path}: {e}", file=sys.stderr)
        return 2

    out_name = f"{in_path.stem}.txt"
    out_path = Path.cwd() / out_name
    try:
        with out_path.open("w", encoding="utf-8") as out:
            for i, line in enumerate(lines):
                # Ensure each line is on its own line in the file
                out.write(line)
                if i < len(lines) - 1:
                    out.write("\n")
    except Exception as e:
        print(f"Error writing output to {out_path}: {e}", file=sys.stderr)
        return 3

    print(f"Wrote {len(lines)} lines to {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
