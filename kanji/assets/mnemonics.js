var searchField = $('#search-field');
var resultSetElement = $('#result-set-container');
var confViewContainer = $('#conf-view-container');
var info = $('#info');
var confSearch = $('#conf-search');
var KATAKANA_HIRAGANA_SHIFT = "\u3041".charCodeAt(0) - "\u30a1".charCodeAt(0);
var confEntries = [];

function search() {
    var searchTerm = searchField.val().trim();
    if (searchTerm === "") {
        info.html("No search term");
        return;
    }

    resetConfs();
    var searchTerms = createSearchTerms(searchTerm);
    var matches = multiSearch(searchTerms);

    info.html("Results: " + matches.length);
    renderResults(matches, searchTerms);
    renderConfView(searchTerms);
}

function resetConfs() {
    confEntries = [];
    confViewContainer.html("");
}

function createSearchTerms(searchTerm) {
    if (searchTerm.indexOf(" cf ") !== -1) {
        var searchTerms = searchTerm.split(" cf ");
        confSearch.html("Confusion search. Kanji: " + searchTerms.join(", "));
        return searchTerms;
    } else {
        confSearch.html("");
        confEntries = [];
        return new Array(searchTerm);
    }
}

function renderConfView(searchTerms) {
    if (searchTerms.length < 2) {
        return;
    }
    var confView = "";
    $(confEntries).each(function (index, entry) {
        var confs = [];
        $(confEntries).each(function (index, candidate) {
            if (entry.kj !== candidate.kj) {
                confs.push(candidate);
            }
        });

        var line = entry.kj + ": !conf "
        $(confs).each(function (index, confEntry) {
            line += createConf(confEntry) + ", ";
        });
        confView += line.replace(/, $/, "<br>");
    });

    confViewContainer.html(confView);
}

function renderResults(matches, searchTerms) {
    var html = "<table>";
    var duplicates = [];
    $(matches).each(function (index, entry) {
        if (duplicates.includes(entry.kj)) {
            return;
        }
        if (shouldHighlight(entry, searchTerms)) {
            html += "<tr style='background: rgb(235, 250, 235)'>";
        } else {
            html += "<tr>";
        }

        html += "   <td style='text-align: center'>";
        html += "       <div style='font-size: 1.8em'>" + entry.kj + "</div>";
        html += "" +
            "<div class='kw-table'><table>" +
            "   <tr style='background: none'>" +
            "      <td style='width: 42px'>CP: </td>" +
            "      <td>" + entry.cp + "</td>" +
            "   </tr>" +
            "   <tr style='background: none'>" +
            "      <td>RTK: </td>" +
            "      <td>" + entry.rtk + "</td>" +
            "   </tr>" +
            "</table></div>";
        html += "   </td>";
        html += "   <td class='info'>";
        html += "       " + entry.m + "<br><br>";
        html += "       !conf " + createConf(entry);
        html += "   </td>";
        html += "</tr>";
        duplicates.push(entry.kj);
    });
    html += "</table>";

    resultSetElement.html(html);
}

function shouldHighlight(entry, searchTerms) {
    if (searchTerms.length < 2) {
        return false;
    }
    var putHighlight = false;
    $(searchTerms).each(function (index, searchTerm) {
        if (entry.kj === searchTerm.trim()) {
            confEntries.push(entry);
            putHighlight = true;
        }
    });
    return putHighlight;
}

function createConf(entry) {
    return entry.kj + " (" + entry.r + ", " + getMainKeyword(entry) + ")"
}

function getMainKeyword(entry) {
    if (entry.cp && entry.cp !== "") {
        return  entry.cp;
    }
    return entry.rtk;
}

function collectMatches(searchTerm) {
    var matches = [];
    searchTerm = normalizeSearchTerm(searchTerm);
    $(data).each(function (index, entry) {
        if (hasMatches(searchTerm, entry)) {
            matches.push(entry);
        }
    });
    return matches;
}

function multiSearch(searchTerms) {
    var matches = [];
    $(searchTerms).each(function (index, searchTerm) {
        var singleMatches = collectMatches(searchTerm)
        $(singleMatches).each(function (index, result) {
            matches.push(result);
        });
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
    entry = entry.kj + ", " + entry.m;
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


