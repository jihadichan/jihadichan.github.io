var FIND_ALL = "FIND_ALL";
var linkBreakRegex = new RegExp("・", "g");
var searchInputField = $('#search-field');
// var githubLink = $('#github-link'); todo delete
// var stackExchangeLink = $('#stackexchange-link');
// var googleLink = $('#google-link');

function search() {
    var searchOptions = getSearchOptions();
    if (searchOptions.term === FIND_ALL) {
        renderResultSet(grammarItems, searchOptions);
        return;
    }

    var resultSet = [];
    var searchTerm = searchOptions.regex ? new RegExp(searchOptions.term, "ig") : searchOptions.term;
    var grammarItemsCount = grammarItems.length;
    for (var i = 0; i < grammarItemsCount; i++) {
        var item = grammarItems[i];
        var doc = createDocument(item, searchOptions);
        if (doc.gammarPoint) {
            if (contains(searchOptions.regex, searchTerm, doc.gammarPoint)) {
                addToResultSet(item, resultSet, searchTerm);
                continue;
            }
        }
        if (contains(searchOptions.regex, searchTerm, doc.text)) {
            addToResultSet(item, resultSet, searchTerm);
        }
    }

    renderResultSet(resultSet, searchOptions);
}

function modifyExternalSearchLinks() {
    var searchTerm = searchInputField.val();
    var searchLinks = $('#search-links');
    if (searchTerm) {
        var links = "";
        links += updateSingleGrammarLink(searchTerm, "GitHub Search", "https://github.com/jihadichan/jp/search?l=Markdown&q=");
        links += updateSingleGrammarLink(searchTerm, "StaEx Search", "https://japanese.stackexchange.com/search?q=");
        links += updateSingleGrammarLink(searchTerm, "Google Search", "https://www.google.com/search?q=grammar+");
        links += updateSingleGrammarLinkTatobea(searchTerm, "Tatobea Search");
        searchLinks.html(links);
    }　else {
        searchLinks.html("");
    }
}

function updateSingleGrammarLink(searchTerm, linkText, url) {
    return "<div class='search-link'><a target='_blank' href='" + url + searchTerm + "'>" + linkText + " -> " + searchTerm + "</a><br></div>";
}

function updateSingleGrammarLinkTatobea(searchTerm, linkText) {
    return "<div class='search-link'><a target='_blank' href='https://tatoeba.org/eng/sentences/search?query=%22"  + searchTerm + "%22&from=jpn&to=eng'>" + linkText + " -> " + searchTerm + "</a><br></div>";
}

function renderResultSet(resultSet, searchOptions) {
    $('#result-size').html("Results: " + resultSet.length);

    var element = $('#result-set-container');
    if (resultSet.length <= 0) {
        element.html("<div class='no-results'>No Results, applied options:</div>" +
            "<div class='json'>" +
            "   <pre>" + JSON.stringify(searchOptions, null, 2) + "</pre>" +
            "</div>");
        return;
    }

    var table = "<table><tr><th>Nr.</th><th>Grammar Point</th><th>Details</th></tr>";
    $(resultSet).each(function (index, result) {
        table += "" +
            "<tr>" +
            "   <td><a class='link' target='_blank' href='" + pageBaseUrl + result.fln + ".md'>" + result.fln + "</a></td>" +
            "   <td class='first-column'>" +
            "       " + createLinkText(result) + "" +
            "   </td>" +
            "   <td class='details'>" +
            "       <ul>";

        table += result.sum ? "<li>Summary: " + result.sum + "</li>" : "";
        table += result.eqv ? "<li>Equivalent: " + result.eqv + "</li>" : "";
        table += result.pos ? "<li>Parts of speech: " + result.pos + "</li>" : "";

        table += "  </ul>" +
            "   </td>" +
            "</tr>";
    });
    table += "<table>";

    element.html(table);
}

function createLinkText(item) {
    return item.itm.replace(linkBreakRegex, "<br>");
}

function addToResultSet(item, resultSet, searchTerm) {
    var copy = {
        fln: item.fln
    };
    if (item.itm) copy.itm = addHighlight(item.itm, searchTerm);
    if (item.sum) copy.sum = addHighlight(item.sum, searchTerm);
    if (item.eqv) copy.eqv = addHighlight(item.eqv, searchTerm);
    if (item.pos) copy.pos = addHighlight(item.pos, searchTerm);

    resultSet.push(copy);
}

function addHighlight(text, searchTerm) {

    if (!(searchTerm instanceof RegExp)) {
        searchTerm = new RegExp(searchTerm, "gi");
    }

    var match = text.match(searchTerm);
    if (match) {
        return text.replace(searchTerm, replaceMatchWithHighLight(match[0]));
    }
    return text;
}

function replaceMatchWithHighLight(text) {
    return "<span class='hl'>" + text + "</span>";
}

function contains(shouldUseRegex, term, text) {
    if (shouldUseRegex) {
        return text.match(term) != null;
    } else {
        return text.indexOf(term) !== -1;
    }
}

/** Grammar point is separate because otherwise it wouldn't be possible to do use ^ or $ in regex search */
function createDocument(item, searchOptions) {
    var doc = {};

    var text = "";
    if (searchOptions.grammarPoint) {
        doc.gammarPoint = item.itm;
        text += item.itm ? item.itm + " " : "";
    }
    if (searchOptions.summary) {
        text += item.sum ? item.sum + " " : "";
    }
    if (searchOptions.equivalent) {
        text += item.eqv ? item.eqv + " " : "";
    }
    if (searchOptions.partOfSpeech) {
        text += item.pos ? item.pos + " " : "";
    }
    doc.text = text.toLowerCase();

    return doc;
}

function getSearchOptions() {
    var searchField = searchInputField.val();
    return {
        term: searchField === "" ? FIND_ALL : searchField.toLowerCase(),
        grammarPoint: $('#grammar-point').is(':checked'),
        summary: $('#summary').is(':checked'),
        equivalent: $('#equivalent').is(':checked'),
        partOfSpeech: $('#part-of-speech').is(':checked'),
        regex: $('#regex').is(':checked')
    }
}

function delayed(callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

function getUrlParams() {
    var params = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        params[key] = value;
    });
    return params;
}

function fillSearchFieldFromParams() {
    var params = getUrlParams();
    if (params.q) {
        searchInputField.val(decodeURIComponent(params.q));
        search();
        modifyExternalSearchLinks();
    }
}

// delayed(search, 300) - instant search is shit　with IME. Not much use in practice.
searchInputField.keypress(function (e) {
    if (e.keyCode === 13) {
        search();
    }
});

fillSearchFieldFromParams();
