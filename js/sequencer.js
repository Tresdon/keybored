var canvas = document.getElementById("sequencerCanvas");
var sequencedSounds = [];
var recording = false;
var scrubber;
paper.install(window);

//Canvas / Square Dimensions
var sequencerWidth, gutterWidth, squareWidth, mediumSquareWidth, bigSquareWidth, sequencerHeight, scrubberMovePerFrame;
var squaresArray = [];

/*
 Drawing Functions
 */
function initSequencer() {
    paper.setup(canvas);
    updateSequencerDimensions(function () {
        view.viewSize.height = sequencerHeight;
        drawBeatSquares();
        initScrubber();
    });

    view.draw();

    view.onResize = function (event) {
        updateSequencerDimensions(function () {
            project.activeLayer.children = [];
            view.viewSize.height = sequencerHeight;
            drawBeatSquares();
            initScrubber();
        });
    };

    view.onFrame = function (event) {
        if (sequencerOn) {
            scrubberMovePerFrame = sequencerWidth / (16 / BPM) / 60;
            updateScrubberPostion();
            console.log(scrubber.position.x)
        }
    };
}

function drawBeatSquares() {
    squaresArray = [];
    var x = 10;
    var y = 0;

    for (var i = 0; i < 32; i++) {
        if (squaresArray[i - 1] != undefined) {
            x = squaresArray[i - 1].right + gutterWidth;
        }
        var width = squareWidth;

        if (i % 8 == 0) {   //New Measure
            width = bigSquareWidth;
        }
        else if (i % 2 == 0) { //On Beat
            width = mediumSquareWidth;
        }

        var square = new Rectangle(x, y, width, width);
        square.center = new Point(x + (width / 2), sequencerHeight / 2);
        var path = new Path.Rectangle(square);
        path.fillColor = 'black';
        squaresArray.push(square);
    }
}

function initScrubber() {
    scrubber = new Path.Line({
        from: [5, 0],
        to: [5, sequencerHeight],
        strokeColor: 'blue',
        strokeWidth: 5
    });
}

function updateScrubberPostion() {
    if (scrubber.position.x > sequencerWidth - 5) {
        scrubber.position.x = 5;
    }
    else {
        scrubber.position.x += scrubberMovePerFrame;
    }
}

function updateSequencerDimensions(callback) {
    sequencerWidth = canvas.offsetWidth;
    gutterWidth = 6;
    squareWidth = (sequencerWidth - (34 * gutterWidth)) / 42;
    mediumSquareWidth = squareWidth * 1.5;
    bigSquareWidth = squareWidth * 2;
    sequencerHeight = bigSquareWidth * 1.5;
    scrubberMovePerFrame = sequencerWidth / (BPM / 16) / 60;
    callback.apply(this, []);
}

/*
 Feature Functions
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
    moveScrubber();
    sequencer(0);
}

function stopSequencer() {
    sequencerOn = false;
}

function moveScrubber() {

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