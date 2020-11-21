var CORS_PROXY = "https://jp-learner.herokuapp.com/";
var lastCalledJishoUrl = "";
var lastReceivedJishoResponse = "";
var lastCalledGoogleTranslateUrl = "";
var lastReceivedGoogleTranslateResponse = "";
var currentVocabMarkupObj = {};

function toCsvRow() {

    var focus = $('#focus').val().trim();
    if (focus !== "") {
        focus = focus.replace(/(?:\r\n|\r|\n)/g, "<br>") + "<br><br>";
    }
    var sentence = focus + $('#sentence').val();
    var notes = $('#notes').val();
    var source = $('#source').val();
    var row = "";

    if (sentence === "") {
        alert("Sentence field must not be empty")
    }

    row += sentence + "\t";
    row += notes.replace(/(?:\r\n|\r|\n)/g, "<br>") + "\t";
    if (source.trim() !== "") {
        row += source.replace(/(?:\r\n|\r|\n)/g, "<br>") + "\t";
    } else {
        row += " ";
    }

    copyText(row)

}

function copyText(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.error('Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function reset() {
    $('#sentence').val("");
    $('#notes').val("");
    $('#source').val("");
    $('#focus').val("");
    resetMarkupObj();
}

function getSelectedText() {
    var selectedText = "";
    if (window.getSelection) {
        selectedText = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== "Control") {
        selectedText = document.selection.createRange().text;
    }
    return selectedText;
}

function renderTranslateLookup() {
    var selectedText = getSelectedText();
    var isFullSentence = false;
    if (selectedText === "") {
        selectedText = $('#sentence').val().replace(/.*<br\/?>/, "");
        isFullSentence = true;
    }

    var form = "" +
        "<div class=\"search-inputs\">" +
        "<label>" +
        "   <span class=\"hint\">Looks up words via Google Translate</span>" +
        "   <input type=\"text\" id=\"search-field\" placeholder=\" Search...\" value=\"" + selectedText + "\"/>" +
        "   <input type=\"button\" id='search-button' onclick=\"fetchTranslate(" + isFullSentence + ")\" value=\"Search\">" +
        "</label>" +
        "<div id='translate-result'></div>" +
        "</div>";

    $('#modal').html(form);
    $('#search-field').keypress(function (e) {
        if (e.keyCode === 13) {
            fetchTranslate(isFullSentence);
        }
    });
}

function fetchTranslate(isFullSentence) {
    var query = $('#search-field').val().trim();
    if (query !== "") {
        fetchWordFromGoogleTranslate(query, isFullSentence);
    }
}


function fetchWordFromGoogleTranslate(query, isFullSentence) {
    var container = $('#translate-result');

    var url = createGoogleTranslateUrl(query);
    if (url === lastCalledGoogleTranslateUrl) {
        renderGoogleTranslateResult(container, lastReceivedGoogleTranslateResponse, isFullSentence);
        return;
    }
    lastCalledGoogleTranslateUrl = url;

    jQuery.ajax({
        type: "GET",
        url: url,
        beforeSend: function () {
            container.html("<div class='loading'>Loading</div>");
        },
        success: function (body) {
            lastReceivedGoogleTranslateResponse = body;
            renderGoogleTranslateResult(container, body, isFullSentence);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#debug').text("Couldn't fetch response from Jisho API. Probably cross origin proxy failed or API is down.")
        }
    });
}

function createGoogleTranslateUrl(query) {
    return CORS_PROXY + "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&hl=en-US&dt=t&dt=bd&dj=1&source=icon&tk=0.0&q=" + encodeURIComponent(query);
}

function renderGoogleTranslateResult(container, response, isFullSentence) {
    var orig = "";
    var trans = "";
    $(response.sentences).each(function (index, value) {
        orig += value.orig;
        trans += value.trans;
    });
    if (isFullSentence) {
        trans = "- GT: " + trans;
    } else {
        trans = "- GT: " + orig + " = " + trans;
    }
    container.html("<textarea id='translate-textarea'>" + trans + "</textarea>");
}

/*****************************************************/
// JISHO VOCAB
/*****************************************************/

function renderJishoVocabLookup() {
    var selectedText = getSelectedText();

    var form = "" +
        "<div class=\"search-inputs\">" +
        "<label>" +
        "   <span class=\"hint\">Looks up words via Jisho API</span>" +
        "   <input type=\"text\" id=\"search-field\" placeholder=\" Search...\" value=\"" + selectedText + "\"/>" +
        "   <input type=\"button\" id='search-button' onclick=\"searchWord()\" value=\"Search\">" +
        "</label>" +
        "</div>";

    $('#modal').html(form);
    $('#search-field').keypress(function (e) {
        if (e.keyCode === 13) {
            searchWord();
        }
    });
}

function searchWord() {
    var term = $('#search-field').val().trim();
    if (term !== "") {
        fetchWordFromJishoApi(term);
    }
}

function createJishoApiUrl(word) {
    return CORS_PROXY + "https://jisho.org/api/v1/search/words?keyword=" + word;
}


function fetchWordFromJishoApi(word) {
    var modal = $('#modal');

    var url = createJishoApiUrl(word);
    if (url === lastCalledJishoUrl) {
        renderTranslationTable(modal, lastReceivedJishoResponse);
        return;
    }
    lastCalledJishoUrl = url;

    jQuery.ajax({
        type: "GET",
        url: url,
        beforeSend: function () {
            modal.html("<div class='loading'>Loading</div>");
        },
        success: function (body) {
            lastReceivedJishoResponse = body;
            renderTranslationTable(modal, body);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // todo show in modal
            $('#debug').text("Couldn't fetch response from Jisho API. Probably cross origin proxy failed or API is down.")
        }
    });
}

function getMarkupTextAreaHtml() {
    return "" +
        "<div class='vocab-output'>" +
        "   <div id='vocab-preview'></div>" +
        "   <label><textarea id='vocab-markup'></textarea><button style='float: right' onclick='resetMarkupObj()'>Reset</button></label>" +
        "</div>"
}

function renderTranslationTable(modal, body) {
    var data = body.data;
    var html = "";

    // OUTPUT
    html += getMarkupTextAreaHtml();

    // WORDS
    html += "<div class='translation-table'><table>";
    $(data).each(function (index, entity) {

        var word = extractWord(entity);
        var rt = word.reading ? "<rt>" + word.reading + "</rt>" : "";
        html += "" +
            "<tr class='translation-row'>" +
            "   <td class='translation-writing'>" +
            "       <ruby>" + word.writing + rt + "</ruby>" +
            "   </td>" +
            "   <td class='translation-english'><ul>";

        $(entity.senses).each(function (index2, sense) {
            var entry = {
                word: word,
                allForms: extractOtherForms(entity.japanese),
                sense: sense.english_definitions.join("; ") + createTagsAndInfo(sense)
            };
            html += "<li class='translation-sense' onclick='addToVocabMarkupTextarea(\"" + escape(encodeURIComponent(JSON.stringify(entry))) + "\")'>" + sense.english_definitions.join("; ") + "</li>";
        });
        html += "" +
            "   </ul></td>" +
            "</tr>";
    });
    html += "</table></div>";
    modal.html(html);

    updateVocabMarkUp();
}

function createTagsAndInfo(sense) {
    var info = "";
    if (!sense.tags && !sense.info) {
        return "";
    }
    if (sense.tags.length > 0 || sense.info.length > 0 || sense.parts_of_speech.length) {
        info += "<div class=\"info\">(";
        var infoArray = [];
        if (sense.parts_of_speech.length > 0) infoArray.push(sense.parts_of_speech.filter(function (val) {
            return val;
        }).join("; "));
        if (sense.info.length > 0) infoArray.push(sense.info.filter(function (val) {
            return val;
        }).join("; "));
        if (sense.tags.length > 0) infoArray.push(sense.tags.filter(function (val) {
            return val;
        }).join("; "));
        info += infoArray.filter(function (val) {
            return val;
        }).join("; ");
        info += ")</div>";
    }
    info = info.replace("Usually written using kana alone", "usu. written as kana");

    return info;
}

function resetMarkupObj() {
    currentVocabMarkupObj = {};
    updateVocabMarkUp();
}

function updateVocabMarkUp() {
    var markup = createMarkupText();
    $('#vocab-markup').val(markup);
    $('#vocab-preview').html(createVocabTableHtml(markup.split("\n")));
}

function addToVocabMarkupTextarea(entry) {
    entry = JSON.parse(decodeURIComponent(unescape(entry)));

    // Create new word
    if (!currentVocabMarkupObj[entry.word.writing]) {
        // Main word
        var word = {};
        word.word = [entry.word];

        // Other Forms
        var otherForms = addOtherForms(entry.allForms, entry.word);
        if (otherForms.length > 0) {
            word.word = word.word.concat(otherForms);
        }

        // Senses
        word.senses = [];
        word.senses.push(entry.sense);
        currentVocabMarkupObj[entry.word.writing] = word;
    } else { // Add to existing word
        var isAlreadyInSenses = false;
        $(currentVocabMarkupObj[entry.word.writing].senses).each(function (index, existingSense) {
            if (existingSense === entry.sense) {
                isAlreadyInSenses = true;
            }
        });
        if (!isAlreadyInSenses) {
            currentVocabMarkupObj[entry.word.writing].senses.push(entry.sense);
        }
    }

    updateVocabMarkUp();
}

function addOtherForms(allForms, existingForm) {
    var otherForms = [];
    $.each(allForms, function (index, word) {
        if (word.writing !== existingForm.writing) {
            otherForms.push(word);
        }
    });
    return otherForms;
}

function extractOtherForms(otherFormsRaw) {
    var otherForms = [];
    $.each(otherFormsRaw, function (index, entity) {
        var word = {};
        if (entity.word) {
            word.writing = entity.word;
        }
        if (entity.reading) {
            if (word.writing) {
                word.reading = entity.reading;
            } else {
                word.writing = entity.reading;
            }
        }
        otherForms.push(word);
    });

    return otherForms;
}

function createMarkupText() {
    var markup = "";
    $.each(currentVocabMarkupObj, function (key, row) {
        var writing = row.word[0].writing;
        var reading = row.word[0].reading ? "<rt>" + row.word[0].reading + "</rt>" : "";
        var otherForms = "";
        if (row.word.length > 1) {
            otherForms += "<li class='np'><span class='ofrms'>Other Forms　";
            for (var x = 1; x < row.word.length; x++) {
                var oFrmWriting = row.word[x].writing;
                var oFrmReading = row.word[x].reading ? "<rt>" + row.word[x].reading + "</rt>" : "";

                otherForms += "<ruby>" + oFrmWriting + oFrmReading + "</ruby>、";
            }
            otherForms = otherForms.replace(/、 ?$/, "");
            otherForms += "</span></li>";
        }
        markup += "#<ruby>" + writing + reading + "</ruby>:<ul><li>" + row.senses[0] + "</li>";

        if (row.senses.length > 1) {
            for (var i = 1; i < row.senses.length; i++) {
                markup += "<li>" + row.senses[i] + "</li>";
            }
        }
        if (otherForms !== "") {
            markup += otherForms;
        }
        markup += "</ul>\n";
    });
    return markup.replace(/\n$/, "");
}

function extractWord(entity) {
    var word = {};
    if (entity.japanese[0].word) {
        word.writing = entity.japanese[0].word;
    }
    if (entity.japanese[0].reading) {
        if (word.writing) {
            word.reading = entity.japanese[0].reading;
        } else {
            word.writing = entity.japanese[0].reading;
        }
    }
    return word;
}

document.addEventListener('paste', function (e) {
    var pasteData = (e.originalEvent || e).clipboardData.getData('text/plain');
    try {
        var obj = JSON.parse(pasteData);
        console.log("Object from clipboard: ", obj);

        if (obj.japanese) {
            $('#sentence').val(obj.japanese);
        }
        var notes = "";
        if (obj.english) {
            notes += obj.english;
        }
        if (obj.hiragana) {
            notes += "\n- " + obj.hiragana;
        }
        if (notes !== "") {
            $('#notes').val(notes);
        }
        if (obj.source) {
            $('#source').val(obj.source);
        }

    } catch (exception) {
        console.log("No suitable object recognized");
    }
});

function createVocabTableHtml(vocabLines) {
    var table = "";
    if (vocabLines.length > 0) {
        table += "<div class='vocab'>Vocab</div><table class='vocab-table'>";

        $(vocabLines).each(function (index, value) {
            if (value !== "") {
                var split = value.split(":");
                var word = split[0].replace(/^# */, "").trim();
                var translation = split.length === 2 ? split[1].trim() : split.slice(1, split.length).join(":");

                if (word.match(/.*\[.*?]/)) {
                    var wordSplit = word.split("\[");
                    var rt = wordSplit.slice(1, wordSplit.length).join("").replace("]", "");
                    word = "<ruby>" + wordSplit[0] + "<rt>" + rt + "</rt></ruby>";
                }
                var wordCell = word === "" ? "style='border:0 !important;'" : "";
                table += "" +
                    "<tr>" +
                    "   <td class='vocab-word' " + wordCell + " nowrap>" + word + "</td>" +
                    "   <td class='vocab-translation'>" + translation + "</td>" +
                    "</tr>";
            }
        });

        table += "</table>";
    }
    return table;
}

function renderGrammarLookup() {
    var selectedText = getSelectedText();

    var form = "" +
        "<div class=\"search-inputs\">" +
        "<label>" +
        "   <span class=\"hint\">Lookup grammar point:</span><br>" +
        "   <input type=\"text\" style='width: 100%;' id=\"search-field\" placeholder=\" Search...\" " +
        "value=\"" + selectedText + "\" onkeyup='updateGrammarSearchLinks()' onblur='updateGrammarSearchLinks()'/>" +
        "</label>" +
        "<div><a target='_blank' id='github-search'></a></div>" +
        "<div><a target='_blank' id='stackexchange-search'></a></div>" +
        "<div><a target='_blank' id='google-search'></a></div>" +
        "<div><a target='_blank' id='tatobea-search'></a></div>" +
        "</div>";

    $('#modal').html(form);
    updateGrammarSearchLinks();
}

function updateGrammarSearchLinks() {
    var searchTerm = $('#search-field').val();
    updateSingleGrammarLink('github-search', "https://jihadichan.github.io/?q=" + searchTerm.trim());
    updateSingleGrammarLink('stackexchange-search', "https://japanese.stackexchange.com/search?q=" + searchTerm.trim());
    updateSingleGrammarLink('google-search', "https://www.google.com/search?q=grammar+" + searchTerm.trim());
    updateSingleGrammarLink('tatobea-search', "https://tatoeba.org/eng/sentences/search?query=%22" + searchTerm.trim() + "%22&from=jpn&to=eng");
}

function updateSingleGrammarLink(cssId, url) {
    var link = $('#' + cssId);
    link.attr("href", url);
    link.text(url);
}

document.onkeyup = function (e) {
    if (e.code === 'Escape') {
        reset();
    }
}
