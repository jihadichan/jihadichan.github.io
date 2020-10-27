var searchField = $('#search-field');
var resultSetElement = $('#result-set-container');
var info = $('#info');
var KATAKANA_HIRAGANA_SHIFT = "\u3041".charCodeAt(0) - "\u30a1".charCodeAt(0);

function search() {
    var searchTerm = searchField.val().trim();
    if (searchTerm === "") {
        info.html("No search term");
        return;
    }
    var matches = collectMatches(searchTerm);
    info.html("Results: " + matches.length);
    renderResults(matches);
}

function renderResults(matches) {
    var html = "<table>";

    $(matches).each(function (index, entry) {
        html += "<tr>";
        html += "   <td style='text-align: center'>";
        html += "       " + entry.k;
        html += "   </td>";
        html += "   <td class='info'>";
        html += "       " + entry.m;
        html += "   </td>";
        html += "</tr>";
    });
    html += "</table>";

    resultSetElement.html(html);
}

function collectMatches(searchTerm) {
    var matches = [];
    searchTerm = normalizeSearchTerm(searchTerm);
    console.log(searchTerm)
    $(data).each(function (index, entry) {
        if (hasMatches(searchTerm, entry)) {
            matches.push(entry);
        }
    });
    return matches;
}

function normalizeSearchTerm(searchTerm) {

    var charArray = searchTerm.split("");
    var resultArray = [];
    $(charArray).each(function (index, ch) {
        if (wanakana.isHiragana(ch)) {
            resultArray.push(wanakana.toKatakana(ch));
        } else if (wanakana.isKatakana(ch)) {
            resultArray.push(wanakana.toHiragana(ch));
        } else {
            resultArray.push(ch);
        }
    });
    var normalized = resultArray.join("");
    if (normalized === searchTerm) {
        return searchTerm;
    }
    return "(" + searchTerm + ")|(" + normalized + ")"
}

function hasMatches(searchTerm, entry) {
    entry = entry.k + ", " + entry.m;
    return entry.search(new RegExp(searchTerm, "i")) > -1;
}

function toHiragana(str) {
    var result = "";
    $.each(str.split(''), function (index, value) {
        if (value > "\u30a0" && value < "\u30f7") {
            result += String.fromCharCode(value.charCodeAt(0) + KATAKANA_HIRAGANA_SHIFT);
        } else {
            result += value;
        }
    });
    return result;
}

searchField.keypress(function (e) {
    if (e.keyCode === 13) {
        search();
    }
});


