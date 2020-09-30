var searchField = $('#search-field');
var resultSetElement = $('#result-set-container');
var aniMelonCom = "https://animelon.com";

function renderTagList() {

    var html = "";
    $(allTags).each(function (index, tag) {
        html += "<span onclick='attach(\"" + tag + "\")'>" + tag + "</span> ";
    });
    $('#all-tags').html(html);
}

function attach(tag) {
    searchField.val(tag);
    search();
}

function search() {
    var searchTerm = searchField.val().trim();
    var matches = collectMatches(searchTerm);
    renderResults(matches);
}

function renderResults(matches) {
    var html = "<table>";

    $(matches).each(function (index, value) {
        var link = aniMelonCom + value.link;
        html += "<tr>";
        html += "   <td>";
        html += "       <a target='_blank' href='" + link + "'>" +
            "               <img alt='" + value.name + "' class='pic' src='" + value.image + "' />" +
            "           </a>";
        html += "   </td>";
        html += "   <td class='info'>";
        html += "       <h2>" + value.name + "</h2>";
        html += "       <div>Release: " + value.release + "</div>";
        html += "       <div>Category: " + value.tags.join(", ") + "</div><br>";
        html += "       <div>" + value.desc + "</div>";
        html += "   </td>";
        html += "</tr>";
    });
    html += "</table>";

    resultSetElement.html(html);
}

function collectMatches(searchTerm) {
    var matches = [];
    $(series).each(function (index, entry) {
        if (
            doesFieldMatch(searchTerm, entry.name) ||
            doesFieldMatch(searchTerm, entry.release) ||
            doesFieldMatch(searchTerm, entry.desc) ||
            doesFieldMatch(searchTerm, entry.tags)
        ) {
            matches.push(entry);
        }
    });
    return matches;
}

function doesFieldMatch(searchTerm, field) {
    if (Array.isArray(field)) {
        field = field.join(", ");
    }
    return field.search(new RegExp(searchTerm, "i")) > -1;
}

searchField.keypress(function (e) {
    if (e.keyCode === 13) {
        search();
    }
});

renderTagList();
