var current = $('#current');
var from = $('#from');
var to = $('#to');
var playButton = $('#playpause');
var playData = [];
var playDataIndex = -1;
var japanese = $('#japanese');
var english = $('#english');
var playingAudio;
var isSessionRunning = false;

// checked / unchecked is reversed because of CSS
function startStop() {
    if (playButton.is(':checked')) {
        if (isSessionRunning) {
            decrementPlayDataIndex();
            nextSentence();
        } else {
            run();
        }
    } else {
        stop();
    }
}

function stop() {
    if(playingAudio) {
        playingAudio.pause();
        playingAudio.currentTime = 0;
    }
}

function decrementPlayDataIndex() {
    if (playDataIndex > -1) {
        playDataIndex--;
    }
}
function incrementPlayDataIndex() {
    if (playDataIndex >= getTo()) {
        playDataIndex++;
    }
}

function reset() {
    isSessionRunning = false;
    playButton.prop("checked", false);
    stop();
    if(from.val().trim() === "") {
        from.val("0");
    }
    if(to.val().trim() === "") {
        to.val(getMaxIndex());
    }
}

function run() {
    // Set up
    var localCurrent = from.val();

    // Create audio array to play
    playData = [];
    $(sentences.slice(localCurrent, getTo())).each(function (index, sentence) {
        sentence.audio = new Audio("meknow/" + sentence.fileName);
        playData.push(sentence);
    })
    playDataIndex = -1;
    isSessionRunning = true;
    nextSentence();
}

function nextSentence() {
    playDataIndex++;
    if (playDataIndex === playData.length) {
        playDataIndex = -1;
        isSessionRunning = false;
        run();
        return;
    }
    var sentence = playData[playDataIndex];
    current.text(sentence.index);
    japanese.text(sentence.japanese)
    english.text(sentence.english);
    playingAudio = sentence.audio;
    sentence.audio.addEventListener('ended', nextSentence);
    sentence.audio.play();
}

function setTotal() {
    $('#total').html(getMaxIndex());
}

function setCurrent() {
    current.html(0);
}

function setFromTo() {
    const urlParams = new URLSearchParams(window.location.search);
    var fromNr = urlParams.get("from");
    var toNr = urlParams.get("to");
    if (fromNr !== null) {
        from.val(fromNr);
        current.html(fromNr);
    } else {
        from.val(0);
    }
    if (toNr !== null) {
        if (fromNr > toNr) {
            toNr = fromNr;
        }
        to.val(toNr);
    } else {
        to.val(getMaxIndex());
    }
}

function getMaxIndex() {
    return sentences.length - 1;
}

function getTo() {
    if(parseInt(from.val()) > parseInt(to.val())) {
        to.val(from.val());
    }
    return parseInt(to.val()) + 1;
}

function search(term) {
    var resultSet = [];
    $(sentences).each(function (index, sentence) {
        if (sentence.japanese.indexOf(term) !== -1 || sentence.english.indexOf(term) !== -1) {

            resultSet.push(sentence);
        }
    });
    console.log(JSON.stringify(resultSet, null, '\t'));
}

document.onkeyup = function(e) {
    if (e.code === "Space") {
        if (playButton.is(':checked')) {
            playButton.prop("checked", false);
        } else {
            playButton.prop("checked", true);
        }
        startStop();
    }
    if (e.code === "ArrowDown") {
        if(isSessionRunning) {
            decrementPlayDataIndex();
            stop();
            nextSentence();
        }
    }
    if (e.code === "ArrowLeft") {
        if(isSessionRunning) {
            decrementPlayDataIndex();
            decrementPlayDataIndex();
            stop();
            nextSentence();
        }
    }
    if (e.code === "ArrowRight") {
        if(isSessionRunning) {
            incrementPlayDataIndex();
            stop();
            nextSentence();
        }
    }
    if (e.code === "KeyE") {
        english.toggle();
    }
}

setCurrent();
setTotal();
setFromTo();

