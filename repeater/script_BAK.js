// var current = $('#current');
// var from = $('#from');
// var to = $('#to');
// var playButton = $('#playpause');
// var loopMarker = $('#loop');
// var stepMarker = $('#step');
// var translationMarker = $('#translate');
// var listenMarker = $('#listen');
// var readMarker = $('#read');
// var playData = [];
// var playDataIndex = 0;
// var japanese = $('#japanese');
// var english = $('#english');
// var playingAudio = new Audio();
// var nextPlayAction = playNextAudioAction;
// var isSessionRunning = false;
// var isInLoop = false;
// var isInStep = false;
// var isInListenMode = false; // Next sentence starts without Japanese or English
// var isInTranslationMode = false; // Next sentence starts without English
// var isInReadingMode = false; // Next sentence starts without sound
//
// // checked / unchecked is reversed because of CSS
// function startStop() {
//     if (isPlayButtonChecked()) {
//         if (isSessionRunning) {
//             playSameSentence();
//         } else {
//             run();
//         }
//     } else {
//         stop();
//     }
// }
//
// function stop() {
//     if (playingAudio) {
//         playingAudio.pause();
//         playingAudio.currentTime = 0;
//     }
// }
//
// function reset() {
//     isSessionRunning = false;
//     setPlayButtonToUnchecked();
//     stop();
//     if (from.val().trim() === "") {
//         from.val("0");
//     }
//     if (to.val().trim() === "") {
//         to.val(getMaxIndex());
//     }
// }
//
// function run() {
//     // Set up todo no limit
//     var localCurrent = parseInt(from.val());
//     if (getTo() - localCurrent > 500) {
//         var plus500 = localCurrent + 500;
//         if (plus500 >= sentences.length - 1) {
//             to.val(sentences.length - 1);
//         } else {
//             to.val(plus500);
//         }
//     }
//
//     // Create audio array to play
//     playData = [];
//     $(sentences.slice(localCurrent, getTo())).each(function (index, sentence) {
//         try {
//             sentence.audio = new Audio("meknow/" + sentence.fileName);
//             playData.push(sentence);
//         } catch (e) {
//             console.log("At index " + sentence.index + " - Failed to load " + sentence.fileName)
//         }
//     })
//     // playDataIndex = 0;
//     isSessionRunning = true;
//     playSameSentence(); // i.e. playDataIndex == 0
// }
//
// function nextSentence(addition) {
//     if (addition === undefined) {
//         throw "addition must be set";
//     }
//
//     addToPlayDataIndex(addition);
//     if (playDataIndex === playData.length) {
//         playDataIndex = 0;
//         isSessionRunning = false;
//         run();
//         return;
//     }
//
//     var sentence = playData[playDataIndex];
//     current.text(sentence.index);
//
//     // JP & EN
//     if (isInListenMode) {
//         japanese.hide();
//         english.hide();
//     } else {
//         japanese.show();
//     }
//     japanese.text(sentence.japanese);
//
//     isInTranslationMode ? english.hide() : english.show();
//     english.text(sentence.english);
//
//     // Audio
//     playingAudio = sentence.audio;
//     playingAudio.addEventListener('ended', getNextPlayAction);
//     if (isInReadingMode) {
//         sentence.audio.muted = true;
//     }
//     if (addition === 0) {
//         sentence.audio.muted = false;
//     }
//     playingAudio.play();
// }
//
// function getNextPlayAction() {
//     return nextPlayAction();
// }
//
// function doNotPlayNextAction() {
//     // NO OP
// }
//
// function playNextAudioAction() {
//     nextSentence(1);
// }
//
// function playSameAudioAction() {
//     nextSentence(0);
// }
//
// function addToPlayDataIndex(addition) {
//     var result = playDataIndex + addition;
//     if (result < 0 || result >= sentences.length - 1) {
//         return;
//     }
//     if (isInLoop) {
//         return;
//     }
//     playDataIndex += addition;
// }
//
// function playNextSentence() {
//     nextSentence(1);
// }
//
// function playPreviousSentence() {
//     nextSentence(-1);
// }
//
// function playSameSentence() {
//     nextSentence(0);
// }
//
// function setTotal() {
//     $('#total').html(getMaxIndex());
// }
//
// function setCurrent(value) {
//     current.html(value);
// }
//
// function setFromTo() {
//     const urlParams = new URLSearchParams(window.location.search);
//     var fromNr = urlParams.get("from");
//     var toNr = urlParams.get("to");
//     if (fromNr !== null) {
//         from.val(fromNr);
//         current.html(fromNr);
//     } else {
//         from.val(0);
//     }
//     if (toNr !== null) {
//         if (fromNr > toNr) {
//             toNr = fromNr;
//         }
//         to.val(toNr);
//     } else {
//         to.val(getMaxIndex());
//     }
// }
//
// function getMaxIndex() {
//     return sentences.length - 1;
// }
//
// function getTo() {
//     if (parseInt(from.val()) > parseInt(to.val())) {
//         to.val(from.val());
//     }
//     return parseInt(to.val()) + 1;
// }
//
// function search(term) {
//     var resultSet = [];
//     $(sentences).each(function (index, sentence) {
//         if (sentence.japanese.indexOf(term) !== -1 || sentence.english.indexOf(term) !== -1) {
//
//             resultSet.push(sentence);
//         }
//     });
//     console.log(JSON.stringify(resultSet, null, '\t'));
// }
//
// function toggleLoop() {
//     loopMarker.toggle();
//     isInLoop = !isInLoop;
// }
//
// function disableLoop() {
//     isInLoop = false;
// }
//
// function enableLoop() {
//     isInLoop = true;
// }
//
// function hideAndDisableStep() {
//     stepMarker.hide();
//     disableStep();
// }
//
// function hideAndDisableLoop() {
//     loopMarker.hide();
//     disableLoop();
// }
//
// function disableStep() {
//     isInStep = false;
// }
//
//
// function togglePlayButton() {
//     if (playButton.is(':checked')) {
//         playButton.prop("checked", false);
//     } else {
//         playButton.prop("checked", true);
//     }
// }
//
// function isPlayButtonChecked() {
//     return playButton.is(':checked');
// }
//
// function setPlayButtonToChecked() {
//     playButton.prop("checked", true);
// }
//
// function setPlayButtonToUnchecked() {
//     playButton.prop("checked", false);
// }
//
// function isAudioPlaying() {
//     return !playingAudio.paused;
// }
//
// document.onkeyup = function (e) {
//     if (e.code === "Space") {
//         stepMarker.hide();
//         isInStep = false;
//         togglePlayButton();
//         nextPlayAction = playNextAudioAction;
//         startStop();
//     }
//     if (e.code === "ArrowLeft") {
//         if (isSessionRunning) {
//             stop();
//             if (!isPlayButtonChecked) {
//                 setPlayButtonToChecked();
//             }
//             if (isInLoop) {
//                 disableLoop();
//                 playPreviousSentence();
//                 enableLoop();
//             } else {
//                 playPreviousSentence();
//             }
//         }
//     }
//     if (e.code === "ArrowRight") {
//         if (isSessionRunning) {
//             stop();
//             if (!isPlayButtonChecked) {
//                 setPlayButtonToChecked();
//             }
//             if (isInLoop) {
//                 disableLoop();
//                 playNextSentence();
//                 enableLoop();
//             } else {
//                 playNextSentence();
//             }
//         }
//     }
//     if (e.code === "ArrowUp") {
//         toggleLoop();
//
//         if (isInLoop) {
//             hideAndDisableStep();
//             nextPlayAction = playSameAudioAction;
//         } else {
//             nextPlayAction = playNextAudioAction;
//         }
//
//         if (!isAudioPlaying()) {
//             stop();
//             playSameSentence();
//         }
//         if (isInReadingMode) {
//             playingAudio.muted = false;
//         }
//     }
//     if (e.code === "ArrowDown") {
//         if (isSessionRunning) {
//             stepMarker.show();
//             isInStep = true;
//             hideAndDisableLoop();
//             setPlayButtonToUnchecked();
//             nextPlayAction = doNotPlayNextAction;
//             if (!isAudioPlaying()) {
//                 stop();
//                 playSameSentence();
//             }
//             if (isInReadingMode) {
//                 playingAudio.muted = false;
//             }
//         }
//     }
//     if (e.code === "KeyE") {
//         english.toggle();
//     }
//     if (e.code === "KeyJ") {
//         japanese.toggle();
//     }
//     if (e.code === "Digit1") {
//         isInTranslationMode = !isInTranslationMode;
//         translationMarker.toggle();
//         english.hide();
//     }
//     if (e.code === "Digit2") {
//         isInReadingMode = !isInReadingMode;
//         readMarker.toggle();
//         playingAudio.muted = true;
//     }
//     if (e.code === "Digit3") {
//         isInListenMode = !isInListenMode;
//         listenMarker.toggle();
//         japanese.hide();
//         english.hide();
//     }
//     if (e.code === "Digit4") {
//         isInListenMode = false;
//         listenMarker.hide();
//
//         isInReadingMode = false;
//         readMarker.hide();
//
//         isInTranslationMode = false;
//         translationMarker.hide();
//
//         japanese.show();
//         english.show();
//         playingAudio.muted = false;
//     }
// }
//
// setCurrent(0);
// setTotal();
// setFromTo();
//
// // todo delete
// var audio = new Audio();
// var stringval = "asdf";
// console.log(typeof audio == "object");
// console.log(typeof stringval == "string");
//
//
