function toCsvRow() {
    var sentence = $('#sentence').val();
    var notes = $('#notes').val();
    var source = $('#source').val();
    var row = "";

    if (sentence === "") {
        alert("Sentence field must not be empty")
    }

    row += sentence + "\t";
    row += notes.replace(/\n/g, "<br>") + "\t";
    row += source.replace(/\n/g, "<br>") + "\t";

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
}
