var elem = document.getElementById("sequencer");
var sequencedSounds = [];


// Widths
var sequencerWidth = elem.offsetWidth;
var gutterWidth = 10;
var squareWidth = (sequencerWidth - (32 * (gutterWidth + 4))) / 42;
var mediumSquareWidth = squareWidth * 1.5;
var bigSquareWidth = squareWidth * 2;

var sequencerHeight = bigSquareWidth * 1.2;

var params = {width: sequencerWidth, height: sequencerHeight, transparent: true};

function initSequencer() {
    var renderer = PIXI.autoDetectRenderer(params);
    elem.appendChild(renderer.view);
    var stage = new PIXI.Container();
    renderer.render(stage);
}

/*
function drawBeatSquares() {
    var squaresArray = [];


    for (var i = 0; i < 32; i++) {

        var bigsBefore = Math.floor(i / 8) + 1;
        var mediumsBefore = Math.floor((i / 2) - bigsBefore) + 1;

        var x = 0; //initial offset

        if(squaresArray[i - 1] != undefined){
            var prevSquareDimensions = squaresArray[i-1].getBoundingClientRect();
            x = prevSquareDimensions.right + gutterWidth;
        }

        console.log(i, x);

        if (i % 8 == 0) {   //New Bar
            squaresArray.push(two.makeRectangle(x + squareWidth, sequencerHeight / 2, bigSquareWidth, bigSquareWidth));
        }

        else if (i % 2 == 0) { //On Beat
            squaresArray.push(two.makeRectangle(x + squareWidth, sequencerHeight / 2, mediumSquareWidth, mediumSquareWidth));
        }
        else {
            squaresArray.push(two.makeRectangle(x + squareWidth, sequencerHeight / 2, squareWidth, squareWidth));
        }
    }
}
*/


function toggleSequencer() {
    if (sequencerOn) {
        stopSequencer();
    } else {
        startSequencer();
    }
}

function startSequencer() {
    sequencerOn = true;
    sequencer(0);
}

function stopSequencer() {
    sequencerOn = false;
}

function sequencer(currentBeat) {
    /*
     For now this will be 4 bars and count up to 32.
     (16 quarter notes (beats) so 32 1/8s)

     If the number is past that we should start back at 0 ya feel.

     Cryptic hardcoded calculation but to figure out when we need to hit the next beat we want
     to artificially double the BPM (since we're counting in eights);
     */

    if (sequencerOn) {
        var step = steps[currentBeat];
        playSequencedSounds(currentBeat);

        setTimeout(function () {
            if (currentBeat >= 31) {
                sequencer(0);
            }
            else {
                sequencer(currentBeat + 1);
            }
        }, 60 / BPM / 2 * 1000)
    }
}

/* sequence a sound at a given beat index */
function sequence(soundIndex, beatIndex) {
    var beatArray = sequencedSounds[beatIndex];
    if (!beatArray.includes(soundIndex)) {
        beatArray.push(soundIndex);
    }
}

// Plays all the sounds that are set to play at that beat
function playSequencedSounds(beatIndex) {
    playSound(1);
    for (var i = 0; i < sequencedSounds[beatIndex].length; i++) {
        playSound(sequencedSounds[beatIndex][i]);
    }
}

function addRandom() {
    var randomPosition = Math.floor(Math.random() * 32);
    var randomSound = Math.floor(Math.random() * sounds.length);
    sequencedSounds[randomPosition].push(randomSound);
}