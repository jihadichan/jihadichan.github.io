var current = $('#current');
var from = $('#from');
var to = $('#to');
var playButton = $('#playpause');
var loopMarker = $('#loop');
var playData = [];
var playDataIndex = 0;
var japanese = $('#japanese');
var english = $('#english');
var playingAudio;
var isSessionRunning = false;
var isInLoop = false;

// checked / unchecked is reversed because of CSS
function startStop() {
    if (playButton.is(':checked')) {
        if (isSessionRunning) {
            playSameSentence();
        } else {
            run();
        }
    } else {
        stop();
    }
}

function stop() {
    if (playingAudio) {
        playingAudio.pause();
        playingAudio.currentTime = 0;
    }
}

function reset() {
    isSessionRunning = false;
    playButton.prop("checked", false);
    stop();
    if (from.val().trim() === "") {
        from.val("0");
    }
    if (to.val().trim() === "") {
        to.val(getMaxIndex());
    }
}

function run() {
    // Set up
    var localCurrent = parseInt(from.val());
    if (getTo() - localCurrent > 500) {
        var plus500 = localCurrent + 500;
        if (plus500 >= sentences.length - 1) {
            to.val(sentences.length - 1);
        } else {
            to.val(plus500);
        }
    }

    // Create audio array to play
    playData = [];
    $(sentences.slice(localCurrent, getTo())).each(function (index, sentence) {
        try {
            sentence.audio = new Audio("meknow/" + sentence.fileName);
            playData.push(sentence);
        } catch (e) {
            console.log("At index " + sentence.index + " - Failed to load " + sentence.fileName)
        }
    })
    // playDataIndex = 0;
    isSessionRunning = true;
    playSameSentence(); // i.e. playDataIndex == 0
}

function nextSentence(addition) {
    if (addition === undefined) {
        throw "addition must be set";
    }

    addToPlayDataIndex(addition);
    if (playDataIndex === playData.length) {
        playDataIndex = 0;
        isSessionRunning = false;
        run();
        return;
    }

    var sentence = playData[playDataIndex];
    current.text(sentence.index);
    japanese.text(sentence.japanese)
    english.text(sentence.english);
    playingAudio = sentence.audio;
    sentence.audio.addEventListener('ended', playNextSentence);
    sentence.audio.play();
}

function addToPlayDataIndex(addition) {
    var result = playDataIndex + addition;
    if (result < 0 || result >= sentences.length - 1) {
        return;
    }
    if (isInLoop) {
        return;
    }
    playDataIndex += addition;
}

function playNextSentence() {
    nextSentence(1);
}

function playPreviousSentence() {
    nextSentence(-1);
}

function playSameSentence() {
    nextSentence(0);
}

function setTotal() {
    $('#total').html(getMaxIndex());
}

function setCurrent(value) {
    current.html(value);
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
    if (parseInt(from.val()) > parseInt(to.val())) {
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

function toggleLoop() {
    isInLoop = !isInLoop;
}

function disableLoop() {
    isInLoop = false;
}

function enableLoop() {
    isInLoop = true;
}

function togglePlayButton() {
    if (playButton.is(':checked')) {
        playButton.prop("checked", false);
    } else {
        playButton.prop("checked", true);
    }
}

document.onkeyup = function (e) {
    if (e.code === "Space") {
        togglePlayButton();
        startStop();
    }
    if (e.code === "ArrowDown") {
        if (isSessionRunning) {
            stop();
            playSameSentence();
        }
    }
    if (e.code === "ArrowLeft") {
        if (isSessionRunning) {
            stop();
            if (!playButton.is(':checked')) {
                playButton.prop("checked", true);
            }
            if (isInLoop) {
                disableLoop();
                playPreviousSentence();
                enableLoop();
            } else {
                playPreviousSentence();
            }
        }
    }
    if (e.code === "ArrowRight") {
        if (isSessionRunning) {
            stop();
            if (!playButton.is(':checked')) {
                playButton.prop("checked", true);
            }
            if (isInLoop) {
                disableLoop();
                playNextSentence();
                enableLoop();
            } else {
                playNextSentence();
            }
        }
    }
    if (e.code === "ArrowUp") {
        loopMarker.toggle();
        toggleLoop();
    }
    if (e.code === "KeyE") {
        english.toggle();
    }
}

setCurrent(0);
setTotal();
setFromTo();

