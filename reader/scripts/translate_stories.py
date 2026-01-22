#!/usr/bin/env python3
"""
Translate multi-story text files via Google Gemini and merge JSON outputs.

Features:
- Splits input text by lines containing only --- into separate stories.
- For each story, loads the prompt template (scripts/_translation-prompt.txt)
  and replaces the literal token #REPLACE_THIS# with the story text.
- Sends all story prompts concurrently to Gemini 2.5 Pro.
- Parses each LLM response as JSON and concatenates them into a single JSON
  array, preserving order of stories.
- Writes the final JSON to a file in the same folder as the input.

Usage:
    python translate_stories.py peter-rabbit.txt \
        --prompt _translation-prompt.txt \
        --max-workers 10 \
        --output peter-rabbit.gemini.json

Notes:
- Concurrency is bounded; adjust --max-workers as needed. Default is 5.
- API key: set GOOGLE_API_KEY env var.
- Model: defaults to gemini-2.5-pro; you may change via --model.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, List, Optional, Sequence, Tuple, Union


# ==========================
# Configuration
# ==========================
DEFAULT_MODEL = "gemini-2.5-pro"
DEFAULT_PROMPT_PATH = Path("scripts/_translation-prompt.txt")


def _debug(msg: str) -> None:
    print(msg, file=sys.stderr)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def split_stories(raw: str) -> List[str]:
    """Split the input file into stories separated by lines that are exactly '---'.

    - Keeps story order.
    - Trims leading/trailing blank lines in each story.
    - Ignores empty segments.
    """
    parts: List[str] = []
    current: List[str] = []
    lines = raw.splitlines()
    for line in lines:
        if line.strip() == "---":
            if current:
                story = "\n".join(current).strip()
                if story:
                    parts.append(story)
                current = []
        else:
            current.append(line)
    # tail
    if current:
        story = "\n".join(current).strip()
        if story:
            parts.append(story)
    return parts


def fill_prompt(template: str, story: str) -> str:
    return template.replace("#REPLACE_THIS#", story)


_JSON_BLOCK_RE = re.compile(
    r"```json\s*(?P<block>[\s\S]*?)\s*```|```\s*(?P<block2>[\s\S]*?)\s*```|(?P<brace>\{[\s\S]*\})|(?P<brack>\[[\s\S]*\])",
    re.IGNORECASE,
)


def extract_json(text: str) -> Any:
    """Try to parse a JSON value from the model text.

    Strategy:
    - If any fenced code block is present, try those first (json or generic).
    - Otherwise, attempt to parse the first {...} or [...] span.
    - On failure, raise ValueError with context.
    """
    candidates: List[str] = []
    for m in _JSON_BLOCK_RE.finditer(text):
        block = m.group("block") or m.group("block2") or m.group("brace") or m.group("brack")
        if block:
            candidates.append(block.strip())
    if not candidates:
        candidates = [text.strip()]
    last_err: Optional[Exception] = None
    for c in candidates:
        try:
            return json.loads(c)
        except Exception as e:  # keep trying
            last_err = e
            continue
    raise ValueError(f"Failed to parse JSON from model output. Last error: {last_err}. Raw excerpt: {text[:300]!r}")


def normalize_piece(piece: Any) -> List[Any]:
    """Normalize a parsed JSON piece into a list of items.

    - If piece is a list, return it.
    - Otherwise, wrap it in a single-element list.
    """
    if isinstance(piece, list):
        return piece
    return [piece]


async def call_gemini_many(
    prompts: Sequence[str],
    *,
    model_name: str,
    api_key: str,
    max_workers: int = 5,
    retries: int = 3,
    initial_backoff: float = 1.0,
    validate_json: bool = False,
) -> List[Any]:
    """Call Gemini for each prompt concurrently, returning parsed JSON or raw text.

    Uses google.genai sync API inside a thread pool.
    """
    try:
        import importlib
        genai = importlib.import_module("google.genai")
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            "google-genai package is required. Install with: pip install google-genai"
        ) from e

    client = genai.Client(api_key=api_key)

    loop = asyncio.get_event_loop()
    executor = ThreadPoolExecutor(max_workers=max_workers)

    async def one_prompt(prompt: str, idx: int) -> Any:
        import time
        delay = initial_backoff
        last_exc: Optional[Exception] = None
        for attempt in range(retries + 1):
            try:
                def _run() -> Any:
                    start = time.perf_counter()
                    # Prefer the Models API; fall back to Responses if needed.
                    try:
                        resp = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                        )
                    except Exception:
                        # Some environments may only expose responses.generate
                        resp = client.responses.generate(
                            model=model_name,
                            contents=prompt,
                        )

                    # Primary path: unified .text
                    if hasattr(resp, "text") and resp.text:
                        text_out = resp.text
                    else:
                        # Fallback: attempt to join candidate parts from either API style
                        text_out = None
                        try:
                            parts = []
                            for cand in getattr(resp, "candidates", []) or []:
                                ct = getattr(cand, "content", None)
                                if ct and getattr(ct, "parts", None):
                                    for p in ct.parts:
                                        if hasattr(p, "text") and p.text:
                                            parts.append(p.text)
                            if parts:
                                text_out = "\n".join(parts)
                        except Exception:
                            pass
                        if text_out is None:
                            text_out = str(resp)

                    elapsed_ms = int((time.perf_counter() - start) * 1000)
                    _debug(f"Received response for story {idx} (attempt {attempt+1}/{retries+1}) in {elapsed_ms} ms; {len(text_out)} chars")

                    if validate_json:
                        # This will raise ValueError if parsing fails, triggering a retry
                        return extract_json(text_out)
                    return text_out

                return await loop.run_in_executor(executor, _run)
            except Exception as e:
                last_exc = e
                _debug(f"Attempt {attempt+1} failed for story {idx}: {e}")
                if attempt >= retries:
                    break
                await asyncio.sleep(delay)
                delay *= 2
        raise RuntimeError(f"Gemini call failed for item {idx}: {last_exc}")

    # Schedule tasks and log submission order for visibility
    tasks: List[asyncio.Task] = []
    for i, p in enumerate(prompts):
        _debug(f"Scheduled story {i} for submission...")
        tasks.append(asyncio.create_task(one_prompt(p, i)))
    results: List[str] = await asyncio.gather(*tasks)
    return results


def default_output_path(input_path: Path) -> Path:
    return input_path.with_suffix("").with_name(input_path.stem + ".gemini.json")


def build_argparser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("input", type=Path, help="Path to multi-story text file (stories delimited by '---' lines)")
    p.add_argument("--prompt", type=Path, default=DEFAULT_PROMPT_PATH, help="Path to prompt template file")
    p.add_argument("--model", default=DEFAULT_MODEL, help="Gemini model name (default: %(default)s)")
    p.add_argument("--output", type=Path, default=None, help="Output JSON file path (default: <input>.gemini.json)")
    p.add_argument("--max-workers", type=int, default=5, help="Max concurrent Gemini requests (default: %(default)s)")
    p.add_argument("--retries", type=int, default=3, help="Retry attempts per request (default: %(default)s)")
    return p


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_argparser().parse_args(argv)

    input_path: Path = args.input
    prompt_path: Path = args.prompt
    model_name: str = args.model
    out_path: Path = args.output or default_output_path(input_path)
    max_workers: int = args.max_workers
    retries: int = args.retries

    if not input_path.exists():
        print(f"Input not found: {input_path}", file=sys.stderr)
        return 2
    if not prompt_path.exists():
        print(f"Prompt template not found: {prompt_path}", file=sys.stderr)
        return 2

    # Resolve API key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: No API key provided. Set GOOGLE_API_KEY env var or edit API_KEY in the script.", file=sys.stderr)
        return 2

    raw = read_text(input_path)
    stories = split_stories(raw)
    if not stories:
        print("No stories found in input (delimiter '---').", file=sys.stderr)
        return 2

    template = read_text(prompt_path)
    prompts = [fill_prompt(template, s) for s in stories]

    _debug(f"Found {len(stories)} stories. Submitting to Gemini concurrently (max_workers={max_workers})...")

    # Run event loop
    results = asyncio.run(
        call_gemini_many(
            prompts,
            model_name=model_name,
            api_key=api_key,
            max_workers=max_workers,
            retries=retries,
            validate_json=True,
        )
    )

    merged: List[Any] = []
    for i, piece in enumerate(results):
        # Insert a delimiter marker at the start of each story's block
        merged.append({"story_start": True})
        _debug(f"Inserted story_start marker for story {i}")
        items = normalize_piece(piece)
        merged.extend(items)
        _debug(f"Merged story {i}: {len(items)} item(s)")

    # Write output
    out_path.parent.mkdir(parents=True, exist_ok=True)
    write_text(out_path, json.dumps(merged, ensure_ascii=False, indent=2))
    print(f"Wrote {len(merged)} items to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
