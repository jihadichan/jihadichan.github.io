var current = $('#current');
var from = $('#from');
var to = $('#to');
var playButton = $('#playpause');
var loopMarker = $('#loop');
var stepMarker = $('#step');
var translationMarker = $('#translate');
var listenMarker = $('#listen');
var readMarker = $('#read');
var randomMarker = $('#random');
var speed = $('#speed');
var repeat
var repeatField = $('#repeat-field');
var repeatCountField = $('#repeat-count');
var playData = [];
var playDataIndex = 0;
var japanese = $('#japanese');
var english = $('#english');
var playingAudio = new Audio();
var nextPlayAction = playNextAudioAction;
var isSessionRunning = false;
var isInLoop = false;
var isInStep = false;
var isInListenMode = false; // Next sentence starts without Japanese or English
var isInTranslationMode = false; // Next sentence starts without English
var isInReadingMode = false; // Next sentence starts without sound
var isInRandomMode = false; // Random sequence
var audioFolder = "meknow";
var lastSentence = null;
var repeatCount = 1;
var isFocussed = false;

// checked / unchecked is reversed because of CSS
function startStop() {
    if (isPlayButtonChecked()) {
        if (isSessionRunning) {
            playSameSentence();
        } else {
            run(false);
        }
    } else {
        stop();
    }
    playButton.blur();
}

function stop() {
    if (playingAudio) {
        playingAudio.pause();
        playingAudio.currentTime = 0;
    }
}

function resetRepeatCount() {
    if(isInLoop) {
        repeatCount = 1;
        repeatCountField.html(repeatCount)
    }
}

function reset() {
    isSessionRunning = false;
    setPlayButtonToUnchecked();
    stop();
    playDataIndex = 0;
    resetRepeatCount();
    if (from.val().trim() === "") {
        from.val("0");
    }
    if (to.val().trim() === "") {
        to.val(getMaxIndex());
    }
}

function run(isRestart) {
    var frm = parseInt(from.val());
    var cur = parseInt(current.text());
    playData = sentences.slice(frm, getTo());
    isSessionRunning = true;
    if(isRestart) {
        playSameSentence(); // i.e. playDataIndex == 0
    } else {
        playCurrentSentence(cur - frm);
    }
}

function nextSentence(addition) {
    if (addition === undefined) {
        throw "addition must be set";
    }

    if (isInRandomMode && addition !== 0) { // only if in random mode and not playing the same
        playDataIndex = randomInt(0, playData.length - 1);
    } else {
        addToPlayDataIndex(addition);
        if (playDataIndex === playData.length) {
            playDataIndex = 0;
            isSessionRunning = false;
            run(true);
            return;
        }
        // prefetch(playDataIndex);
    }

    var sentence = playData[playDataIndex];
    if(lastSentence == null) {
        lastSentence = sentence;
    } else {
        lastSentence.audio.currentSrc = null;
        lastSentence.audio.src = "";
        lastSentence.audio.srcObject = null;
        lastSentence.audio.remove()
        delete lastSentence.audio
        lastSentence = sentence;
    }
    try {
        current.text(sentence.index);
    } catch (e) {
        console.error("Failed to get sentence at index: " + playDataIndex + ", exception: " + e.message)
    }

    // JP & EN
    if (isInListenMode) {
        japanese.hide();
        english.hide();
    } else {
        japanese.show();
    }
    japanese.text(sentence.japanese);

    isInTranslationMode ? english.hide() : english.show();
    english.text(sentence.english);

    // Audio
    if (sentence.audio === undefined) {
        sentence.audio = createAudio(sentence.fileName);
    } else {
        throw new Error("Memory leak, sentence already has audio: "+sentence.japanese)
    }

    playingAudio = sentence.audio;
    playingAudio.addEventListener('ended', getNextPlayAction);
    if (isInReadingMode) {
        sentence.audio.muted = true;
    }
    if (addition === 0) {
        sentence.audio.muted = false;
    }
    try {
        let rate = speed.val()
        if(rate < 50) {
            rate = 50
            speed.val(rate)
        }
        playingAudio.playbackRate=rate / 100;
        playingAudio.play();
    } catch (e) {
        console.log("Couldn't play " + sentence.fileName + " - Reason: " + e.message);
        nextSentence(1);
    }
}

// function prefetch(currentIndex) {
//     for (var i = currentIndex; i < currentIndex + 10 && i < playData.length; i++) {
//         var sentence = playData[i];
//         if (!sentence.audio) {
//             sentence.audio = createAudio(sentence.fileName);
//         }
//     }
// }

function getNextPlayAction() {
    return nextPlayAction();
}

function doNotPlayNextAction() {
    // NO OP
}

function playNextAudioAction() {
    nextSentence(1);
}

function playSameAudioAction() {
    nextSentence(0);
}

function addToPlayDataIndex(addition) {
    if (isInLoop) {
        repeatCount++;
        if(repeatCount <= repeat.val()) {
            repeatCountField.html(repeatCount)
            return;
        } else {
            resetRepeatCount();
            if(addition === 0) {
                addition++;
            }
            repeatCountField.html(repeatCount)
        }
    }
    var result = playDataIndex + addition;
    if (result < 0 || result >= sentences.length - 1) {
        return;
    }
    playDataIndex += addition;
}

function playNextSentence() {
    nextSentence(1);
}

function playCurrentSentence(current) {
    nextSentence(current);
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

function setFocus() {
    isFocussed = true
}

function unsetFocus() {
    isFocussed = false
}

// not used anymore?
// function setCurrent(value) {
//     current.html(value);
// }

function setFromTo() {
    const urlParams = new URLSearchParams(window.location.search);
    var fromNr = urlParams.get("from");
    var toNr = urlParams.get("to");
    var cur = urlParams.get("current");

    if(cur !== null) {
        current.html(cur);
    } else {
        current.html(0);
    }

    if (fromNr !== null) {
        from.val(fromNr);
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
    resetRepeatCount();
    loopMarker.toggle();

    if(!isInLoop) {
        repeatField.html("" +
            "       <label>Repeat: " +
            "           <input type=\"text\" value=\"3\" id=\"repeat\" class=\"fromto\" onfocus=\"setFocus()\" onblur=\"unsetFocus()\"/>" +
            "           @" +
            "       </label>")
        repeatCountField.html(repeatCount);
        repeat = $('#repeat');
    } else {
        repeatField.html("")
        repeatCountField.html("");
        repeat = undefined
    }
    isInLoop = !isInLoop;
}

function disableLoop() {
    isInLoop = false;
}

function enableLoop() {
    isInLoop = true;
}

function hideAndDisableStep() {
    stepMarker.hide();
    disableStep();
}

function hideAndDisableLoop() {
    loopMarker.hide();
    disableLoop();
}

function disableStep() {
    isInStep = false;
}


function togglePlayButton() {
    if (playButton.is(':checked')) {
        playButton.prop("checked", false);
    } else {
        playButton.prop("checked", true);
    }
}

function isPlayButtonChecked() {
    return playButton.is(':checked');
}

function setPlayButtonToChecked() {
    playButton.prop("checked", true);
}

function setPlayButtonToUnchecked() {
    playButton.prop("checked", false);
}

function isAudioPlaying() {
    return !playingAudio.paused;
}

document.onkeyup = function (e) {
    if (e.code === "Space") {
        stepMarker.hide();
        isInStep = false;
        togglePlayButton();
        nextPlayAction = playNextAudioAction;
        startStop();
    }
    if (e.code === "ArrowLeft") {
        resetRepeatCount();
        if (isSessionRunning) {
            stop();
            if (!isPlayButtonChecked) {
                setPlayButtonToChecked();
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
        resetRepeatCount();
        if (isSessionRunning) {
            stop();
            if (!isPlayButtonChecked) {
                setPlayButtonToChecked();
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
        toggleLoop();
        // if (!isPlayButtonChecked()) {
        //     setPlayButtonToChecked();
        // }

        if (isInLoop) {
            hideAndDisableStep();
            nextPlayAction = playSameAudioAction;
        } else {
            nextPlayAction = playNextAudioAction;
        }

        // if (!isAudioPlaying()) {
        //     stop();
        //     playSameSentence();
        // }
        if (isInReadingMode) {
            playingAudio.muted = false;
        }
    }
    if (e.code === "ArrowDown") {
        if (isSessionRunning) {
            stepMarker.show();
            isInStep = true;
            hideAndDisableLoop();
            setPlayButtonToUnchecked();
            nextPlayAction = doNotPlayNextAction;
            if (!isAudioPlaying()) {
                stop();
                playSameSentence();
            }
            if (isInReadingMode) {
                playingAudio.muted = false;
            }
        }
    }
    if (e.code === "KeyE") {
        english.toggle();
    }
    if (e.code === "KeyJ") {
        japanese.toggle();
    }
    if (e.code === "Digit1" && !isFocussed) {
        isInTranslationMode = !isInTranslationMode;
        translationMarker.toggle();
        english.hide();
    }
    if (e.code === "Digit2" && !isFocussed) {
        isInReadingMode = !isInReadingMode;
        readMarker.toggle();
        playingAudio.muted = true;
    }
    if (e.code === "Digit3" && !isFocussed) {
        isInListenMode = !isInListenMode;
        listenMarker.toggle();
        japanese.hide();
        english.hide();
    }
    if (e.code === "Digit4" && !isFocussed) {
        randomMarker.toggle();
        isInRandomMode = !isInRandomMode;
    }

    if (e.code === "Digit5" && !isFocussed) {
        isInListenMode = false;
        listenMarker.hide();

        isInReadingMode = false;
        readMarker.hide();

        isInTranslationMode = false;
        translationMarker.hide();

        japanese.show();
        english.show();
        playingAudio.muted = false;

        randomMarker.hide();
        isInRandomMode = false;
    }
}

function createPathToAudioFile(fileName) {
    return audioFolder + "/" + fileName;
}

function createAudio(fileName) {
    return new Audio(createPathToAudioFile(fileName));
}

// min (included) and max (included), see https://stackoverflow.com/a/29246176/4179212
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

setTotal();
setFromTo();
