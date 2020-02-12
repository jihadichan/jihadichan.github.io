var FIND_ALL = "FIND_ALL";

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
                // console.log("Found in doc.gammarPoint");
                addToResultSet(item, resultSet, searchTerm);
                continue;
            }
        }
        if (contains(searchOptions.regex, searchTerm, doc.text)) {
            // console.log("Found in doc.text");
            addToResultSet(item, resultSet, searchTerm);
        }
    }
    console.log("resultSet", resultSet);
    console.log("searchTerm: ", searchTerm);
    console.log("searchOptions: ", searchOptions);
    renderResultSet(resultSet, searchOptions);
}

function renderResultSet(resultSet, searchOptions) {
    $('#result-size').html("Results: " + resultSet.length)

    var element = $('#result-set-container');
    if (resultSet.length <= 0) {
        element.html("<div class='no-results'>No Results, applied options:</div>" +
            "<div class='json'>" +
            "   <pre>" + JSON.stringify(searchOptions, null, 2) + "</pre>" +
            "</div>");
        return;
    }

    var table = "<table><tr><th>Grammar Point</th><th>Details</th></tr>";
    $(resultSet).each(function (index, result) {
        table += "" +
            "<tr>" +
            "   <td class='first-column'>" +
            "       <a class='link' target='_blank' href='" + pageBaseUrl + result.fln + ".md'>" + result.fln + "." + result.itm + "</a>" +
            "   </td>" +
            "   <td>" +
            "       <ul>";

        table += result.sum ? "<li>" + result.sum + "</li>" : "";
        table += result.eqv ? "<li>" + result.eqv + "</li>" : "";
        table += result.pos ? "<li>" + result.pos + "</li>" : "";

        table += "  </ul>" +
            "   </td>" +
            "</tr>";
    });
    table += "<table>";

    element.html(table);
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
        console.log("CONVERTING TO REGEX - searchTerm: " + searchTerm);
        searchTerm = new RegExp(searchTerm, "gi");
    } else {
        console.log("Already regex - searchTerm: " + searchTerm);
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
        // console.log("text.indexOf(term).length　woth term: " + term + " on text: "+text, text.indexOf(term));
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
    var searchField = $('#search-field').val();
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

// delayed(search, 300) - instant search is shit　with IME. Not much use in practice.
$('#search-field').keypress(function (e) {
    if (e.keyCode === 13) {
        search();
    }
});
