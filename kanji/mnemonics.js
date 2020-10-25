var searchField = $('#search-field');
var resultSetElement = $('#result-set-container');
var info = $('#info');

function search() {
    var searchTerm = searchField.val().trim();
    if (searchTerm === "") {
        info.html("No search term");
        return;
    }
    var matches = collectMatches(searchTerm);
    console.log(matches);
    renderResults(matches);
}

function renderResults(matches) {
    var html = "<table>";

    $(matches).each(function (index, entry) {
        html += "<tr>";
        html += "   <td style='text-align: center'>";
        html += "       "+entry.k;
        html += "   </td>";
        html += "   <td class='info'>";
        html += "       "+entry.m;
        html += "   </td>";
        html += "</tr>";
    });
    html += "</table>";

    resultSetElement.html(html);
}

function collectMatches(searchTerm) {
    console.log(searchTerm)
    var matches = [];
    $(data).each(function (index, entry) {
        if (hasMatches(searchTerm, entry)) {
            matches.push(entry);
        }
    });
    return matches;
}

function hasMatches(searchTerm, entry) {
    entry = entry.k + ", " + entry.m;
    return entry.search(new RegExp(searchTerm, "i")) > -1;
}

searchField.keypress(function (e) {
    if (e.keyCode === 13) {
        search();
    }
});

console.log("\\b" + "かい" + "\\b")

