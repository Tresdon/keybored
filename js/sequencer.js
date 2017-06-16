var canvas = document.getElementById("sequencerCanvas");
var sequencedSounds = [];
var recording = false;
var metronomeOn = true;
var currentBeat = 0;
var activePadColor = '#99a3ee';
var inputMode = false;
var inputIndex = 0;
paper.install(window);

//Canvas / Square Dimensions
var sequencerWidth, gutterWidth, squareWidth, mediumSquareWidth, bigSquareWidth, sequencerHeight;
var squares = [];
var squarePaths = [];
var metronomeSound;

/*
 Drawing Functions
 */
function initSequencer() {
    paper.setup(canvas);
    updateSequencerDimensions(function () {
        view.viewSize.height = sequencerHeight;
        drawBeatSquares();
    });

    view.onResize = function (event) {
        updateSequencerDimensions(function () {
            project.activeLayer.children = [];
            view.viewSize.height = sequencerHeight;
            drawBeatSquares();
        });

    };

    metronomeSound = sounds[9];
}

function drawBeatSquares() {
    squares = [];
    squarePaths = [];
    var x = 0;
    var y = 0;

    for (var i = 0; i < 32; i++) {
        if (squares[i - 1] != undefined) {
            x = squares[i - 1].right + gutterWidth;
        }
        var width = squareWidth;
        var padColor = '#a9a9a9';

        if (i % 8 == 0) {   //New Measure
            width = bigSquareWidth;
            padColor = '#878787';
        }
        else if (i % 2 == 0) { //On Beat
            width = mediumSquareWidth;
            padColor = '#989898';
        }

        var square = new Rectangle(x, y, width, width);
        square.center = new Point(x + (width / 2), sequencerHeight / 2);
        var path = new Path.Rectangle(square, 4);
        path.fillColor = padColor;
        squares.push(square);
        squarePaths.push(path);

        // On clicking a pad you should be able to insert sounds at that beat
        path.onClick = function () {
            for(var i = 0; i < squarePaths.length; i++){
                var currentSquare = squarePaths[i];

                //
                if(currentSquare == this) {
                    this.selected = !this.selected;
                    if(this.selected) {
                        inputMode = true;
                        inputIndex = i;
                    }
                    else {
                        inputMode = false;
                        clearPadStyles();
                    }
                }
                else {
                    clearPadStyles();
                    currentSquare.selected = false;
                }
                showSelectedPads(inputIndex);
            }
        }
    }
}

function updateSequencerDimensions(callback) {
    sequencerWidth = canvas.offsetWidth;
    gutterWidth = 6;
    squareWidth = (sequencerWidth - (34 * gutterWidth)) / 51;
    mediumSquareWidth = squareWidth * 2;
    bigSquareWidth = squareWidth * 3;
    sequencerHeight = bigSquareWidth * 1.5;
    callback.apply(this, []);
}

/*
 Feature Functions
 */
function toggleSequencer() {
    if (sequencerOn) {

        pauseSequencer();
    } else {

        startSequencer();
    }
}

// Play sequencer from wherever playhead currently is
function startSequencer() {
    sequencerOn = true;
    $("#play-pause-image").attr('src', 'images/media_control_icons/pause-black.svg');
    $("#play-pause-button p").text("Pause");
    sequencer();
}

//Resets it to the beginning
function stopSequencer() {
    sequencerOn = false;
    pauseSequencer();
    currentBeat = 0;
}

//Stays at whatever the current beat is
function pauseSequencer() {
    $("#play-pause-image").attr('src', 'images/media_control_icons/play-black.svg');
    $("#play-pause-button p").text("Play");
    sequencerOn = false;
}

function lightUpSquare() {
    var square = squarePaths[currentBeat];
    var oldColor = square.style.fillColor;
    square.style.fillColor = activePadColor;
    setTimeout(function () {
        square.style.fillColor = oldColor;
    }, 200);
}

function sequencer() {
    /*
     For now this will be 4 bars and count up to 32.
     (16 quarter notes (beats) so 32 1/8s)

     Cryptic hardcoded calculation but to figure out when we need to hit the next beat we want
     to artificially double the BPM (since we're counting in eights);
     */
    if (sequencerOn) {
        playSequencedSounds(currentBeat);

        setTimeout(function () {
            if (currentBeat >= 31) {
                currentBeat = 0;
                sequencer();
            }
            else {
                currentBeat += 1;
                sequencer();
            }
        }, 60 / BPM / 2 * 1000)
    }
}

function toggleRecord() {
    if(recording) {
        recording = false;
        $("#record-button img").attr('src', 'images/media_control_icons/record-black.svg');
    } else {
        recording = true;
        $("#record-button img").attr('src', 'images/media_control_icons/record-red.svg');
    }
}

/* sequence a sound at a given beat index */
function sequence(beatIndex, soundIndex) {
    var beatArray = sequencedSounds[beatIndex];
    if (!beatArray.includes(soundIndex)) {
        beatArray.push(soundIndex);
    }
}

// Plays all the sounds that are set to play at that beat
function playSequencedSounds(beatIndex) {
    if(metronomeOn && beatIndex % 2 == 0) {
        metronomeSound.volume(0.2).play();
    }
    for (var i = 0; i < sequencedSounds[beatIndex].length; i++) {
        playSound(sequencedSounds[beatIndex][i]);
        lightUpPad(sequencedSounds[beatIndex][i]);
    }
    lightUpSquare();
}

//Just change the color of buttons for fanciness ya feel.
$("#play-pause-button").hover(function () {
        if(sequencerOn){
            $("#play-pause-image").attr('src', 'images/media_control_icons/pause-blue.svg')
        }
        else{
            $("#play-pause-image").attr('src', 'images/media_control_icons/play-green.svg')
        }
    }, function () {
        if(sequencerOn){
            $("#play-pause-image").attr('src', 'images/media_control_icons/pause-black.svg')
        }
        else{
            $("#play-pause-image").attr('src', 'images/media_control_icons/play-black.svg')
        }
    }
);

$("#stop-button").hover(function () {
    $("#stop-button img").attr('src', 'images/media_control_icons/stop-red.svg')
}, function () {
    $("#stop-button img").attr('src', 'images/media_control_icons/stop-black.svg')
});

$("#record-button").hover(function () {
    $("#record-button img").attr('src', 'images/media_control_icons/record-red.svg')
}, function () {
    if(!recording) {
        $("#record-button img").attr('src', 'images/media_control_icons/record-black.svg')
    }
});