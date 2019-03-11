var canvas = document.getElementById("sequencerCanvas");
var sequencedSounds = [];
var recording = false;
var metronomeOn = true;
var currentBeat = 0;
var activePadColor = '#95b8af';
var recordingColor = '#d2797a';
var playhead, bpmControl, volumeControl;
var inputMode = false;
var inputIndex = 0;
paper.install(window);

//Canvas / Square Dimensions
var sequencerWidth, gutterWidth, squareWidth, mediumSquareWidth, bigSquareWidth, sequencerHeight;
var squares = [];
var squarePaths = [];
var squareOverlays = [];
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
    initDraggableNumbers();

}

function drawBeatSquares() {
    squares = [];
    squarePaths = [];
    squareOverlays = [];
    var x = 0;
    var y = 0;

    for (var i = 0; i < 32; i++) {
        squareOverlays[i] = [];
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

        //Build 4 rectangles for each as overlays
        for (var j = 0; j < 4; j++) {
            var rect = new Path.Rectangle(square.x, square.y + (j * width / 4), width, width / 4);
            rect.strokeColor = padColor;
            if (j == 0) {
                rect.fillColor = '#52BE80'
            } else if (j == 1) {
                rect.fillColor = '#EC7063'
            } else if (j == 2) {
                rect.fillColor = '#BB8FCE'
            } else {
                rect.fillColor = '#5499C7'
            }
            rect.opacity = 0;
            squareOverlays[i].push(rect);

            // On clicking a pad you should be able to insert sounds at that beat
            rect.onClick = function () {
                if (!recording || !sequencerOn) {   //Don't allow insert if it's recording and playing
                    clearPadStyles();
                    for (var i = 0; i < squarePaths.length; i++) {
                        var currentSquare = squarePaths[i];

                        //We've found the square
                        if (currentSquare.bounds.contains(this.bounds)) {
                            //if it's already selected, deselect
                            if (currentSquare.selected) {
                                inputMode = false;
                            }
                            else {
                                inputMode = true;
                                inputIndex = i;
                            }
                            currentSquare.selected = !currentSquare.selected;
                        }
                        else {
                            currentSquare.selected = false;
                        }
                    }
                    showSelectedPads(inputIndex);
                }
            };
        }

        squares.push(square);
        squarePaths.push(path);
    }

    playhead = new Path.RegularPolygon(new Point(0, 0), 3, 10);
    playhead.rotate(180);
    playhead.position = new Point((squares[0].x + squares[0].width / 2), 5);
    playhead.fillColor = activePadColor;
    project.activeLayer.selectedColor = recordingColor
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

function updateBPM() {
    BPM = bpmControl.get()
}

function updateVolume() {
    if (isNaN(volumeControl.get())) {
        volumeControl.set(40);
    }
    else {
        for (var i = 0; i < sounds.length; i++) {
            sounds[i].volume(volumeControl.get() / 100);
        }
    }
}

function initDraggableNumbers() {
    volumeControl = new DraggableNumber(document.getElementById('volume-input'), {
        min: 0,
        max: 100,
        threshold: 1
    });
    bpmControl = new DraggableNumber(document.getElementById('bpm-input'), {
        min: 10,
        max: 250,
        threshold: 5
    });

    //sloppy but with draggable-input.js I can't figure out how to listen to onchange events
    setInterval(function () {
        updateBPM();
        updateVolume();
    }, 500);
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

function toggleMetronome() {
    metronomeOn = !metronomeOn;
    if (metronomeOn) {
        $('#metronome-button img').attr('src', 'images/media_control_icons/metronome-blue.svg')
    }
    else {
        $('#metronome-button img').attr('src', 'images/media_control_icons/metronome-black.svg')
    }
}

// Play sequencer from wherever playhead currently is
function startSequencer() {
    sequencerOn = true;
    $("#play-pause-image").attr('src', 'images/media_control_icons/pause-black.svg');
    $("#play-pause-button + p").text("Pause");
    if (recording) {
        deselectAllSquares();
        playhead.fillColor = recordingColor;
    }
    sequencer();
}

//Resets it to the beginning
function stopSequencer() {
    pauseSequencer();
    setTimeout(function () {
        currentBeat = 0;
        playhead.position = new Point((squares[0].x + squares[0].width / 2), 5);
    }, 200);

}

//Stays at whatever the current beat is
function pauseSequencer() {
    $("#play-pause-image").attr('src', 'images/media_control_icons/play-black.svg');
    $("#play-pause-button + p").text("Play");
    sequencerOn = false;
    playhead.fillColor = activePadColor;
}

function lightUpSquare() {
    var square = squarePaths[currentBeat];
    var oldColor = square.style.fillColor;
    if (recording) {
        square.style.fillColor = recordingColor;
    } else {
        square.style.fillColor = activePadColor;
    }
    setTimeout(function () {
        square.style.fillColor = oldColor;
    }, 200);
}

function deselectAllSquares() {
    inputMode = false;
    for (var i = 0; i < squarePaths.length; i++) {
        squarePaths[i].selected = false;
    }
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
            if (sequencerOn) {   //Check again in case it's been stopped between beats
                if (currentBeat >= 31) {
                    currentBeat = 0;
                    sequencer();
                }
                else {
                    currentBeat += 1;
                    sequencer();
                }
            }
            playhead.position = new Point((squares[currentBeat].x + squares[currentBeat].width / 2), 5);
        }, 60 / BPM / 2 * 1000)
    }
}

function toggleRecord() {
    if (recording) {
        recording = false;
        $("#record-button img").attr('src', 'images/media_control_icons/record-black.svg');
        playhead.fillColor = activePadColor;
    } else {
        playhead.fillColor = recordingColor;
        recording = true;
        $("#record-button img").attr('src', 'images/media_control_icons/record-red.svg');
        deselectAllSquares();
        if (!sequencerOn) {
            startSequencer();
        }
    }
}

/* toggle whether or not a sound is sequenced at a given beat index */
function toggleSequenced(beatIndex, soundIndex) {
    var row = 3;
    if (soundIndex < 12) {
        row = 0;
    }
    else if (soundIndex < 24) {
        row = 1;
    }
    else if (soundIndex < 35) {
        row = 2;
    }
    // If it's not sequenced add it else remove it
    if (!sequencedSounds[beatIndex].includes(soundIndex)) {
        sequencedSounds[beatIndex].push(soundIndex);

    } else {
        sequencedSounds[beatIndex].splice(sequencedSounds[beatIndex].indexOf(soundIndex), 1);
    }
    //logistic function for more dramatic increase in opacity in the beginning.
    var opac = 0;
    var length = getLengthOfSequencedRow(beatIndex, row);
    if (length > 0) {
        opac = 0.5;
    }
    if (length > 1) {
        opac = 0.7
    }
    if (length > 2) {
        opac = 0.8
    }
    if (length > 4) {
        opac = 1;
    }
    squareOverlays[beatIndex][row].opacity = opac;
}

function getLengthOfSequencedRow(index, row) {
    var rowLength = 0;
    var beatSounds = sequencedSounds[index];
    if (row == 0) {
        for (var i = 0; i < beatSounds.length; i++) {
            if (beatSounds[i] < 12) rowLength++;
        }
    } else if (row == 1) {
        for (var i = 0; i < sequencedSounds.length; i++) {
            if (beatSounds[i] >= 12 && beatSounds[i] < 24) rowLength++;
        }
    } else if (row == 2) {
        for (var i = 0; i < sequencedSounds.length; i++) {
            if (beatSounds[i] >= 24 && beatSounds[i] < 35) rowLength++;
        }
    } else if (row == 3) {
        for (var i = 0; i < sequencedSounds.length; i++) {
            if (beatSounds[i] >= 35) rowLength++;
        }
    }
    return rowLength;


}

// Plays all the sounds that are set to play at that beat
function playSequencedSounds(beatIndex) {
    if (metronomeOn && beatIndex % 2 == 0) {
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
        if (sequencerOn) {
            $("#play-pause-image").attr('src', 'images/media_control_icons/pause-blue.svg')
        }
        else {
            $("#play-pause-image").attr('src', 'images/media_control_icons/play-green.svg')
        }
    }, function () {
        if (sequencerOn) {
            $("#play-pause-image").attr('src', 'images/media_control_icons/pause-black.svg')
        }
        else {
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
    if (!recording) {
        $("#record-button img").attr('src', 'images/media_control_icons/record-black.svg')
    }
});

$("#metronome-button").hover(function () {
    $("#metronome-button img").attr('src', 'images/media_control_icons/metronome-blue.svg')
}, function () {
    if (!metronomeOn) {
        $("#metronome-button img").attr('src', 'images/media_control_icons/metronome-black.svg')
    }
});