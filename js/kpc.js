/**
 * Created by tjones on 3/7/17.
 */
var context = undefined;
var speakers = undefined;
var mic = undefined;
var micRecorder = undefined;
var sounds = [];
var recordedSounds = [];
var soundNames = [];
var pads = [];
var keysUsed = "1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./";
var micFeedback = false;
var pad = $('.pad');

// Make a request to find the names of the files to include.
$.get("sounds.txt", function (data) {
    data = data.split("\n");

    // Remove blank lines and comments
    for (var i = 0; i < data.length; i++) {
        if (data[i].startsWith("//") || data[i] == "") {
            data.splice(i, 1);
        }
    }

    for (var x = 0; x < data.length; x++) {
        if (data[x] != "")
            soundNames[x] = data[x];
    }
}).then(init);

// Initialize everything
function init() {

    // Initialize web audio API
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        speakers = context.destination;
    }
    catch (e) {
        alert('Web Audio API is not supported in this browser, try Google Chrome.');
    }

    // Load different soundNames
    for (var i = 0; i < soundNames.length; i++) {
        sounds[i] = new Howl({
            src: [soundNames[i]]
        });
    }

    //Listen for keypress
    document.addEventListener('keydown', keyHandler);

    //Generate list of pads in DOM
    pads = $("#pads").children().children();

    //Request mic access
    initMic();
}

/*
 PAD STUFF
 */
function playSound(index) {
    //If no recorded sample, play default
    if (recordedSounds[index] == undefined) {
        sounds[index].play();
    }
    else {
        recordedSounds[index].play();
    }
}

// What to do when a key is pressed. play the sound, light up the button.
function keyHandler(e) {
    var key = e.key.toLowerCase();
    var index = keysUsed.indexOf(key);
    var pad = pads[index];

    try {
        playSound(index);
        pad.addEventListener('webkitAnimationEnd', function () {
            this.style.webkitAnimationName = ''
        });

        if (index < 12)
            pad.style.webkitAnimationName = 'light-up-1';
        else if (index < 24)
            pad.style.webkitAnimationName = 'light-up-2';
        else if (index < 35)
            pad.style.webkitAnimationName = 'light-up-3';
        else
            pad.style.webkitAnimationName = 'light-up-4';

    } catch (e) {
    }
}

/*
 MICROPHONE STUFF BELOW
 */
function recordIntoPad(index) {
    var chunks = [];
    var imageToChange = pad[index].children[0];


    micRecorder.start();
    setTimeout(function () {
        micRecorder.stop();
    }, 1000);

    micRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
    };

    micRecorder.onstop = function () {
        var blob = new Blob(chunks, {'type': 'audio/mpeg'});

        var reader = new FileReader(blob);
        reader.addEventListener("loadend", function () {
            var sound;

            // Try to create the sound with howler.js
            sound = new Howl({
                src: [reader.result],

                // If we can't, create the sound with <audio> bleck. Fixed in chrome v58
                onloaderror: function () {
                    sound = new Audio(reader.result);
                    recordedSounds[index] = sound;
                    $(imageToChange).attr('src', 'images/clear.svg');
                },

                // Loaded successfully yay
                onload: function () {
                    recordedSounds[index] = sound;
                    $(imageToChange).attr('src', 'images/clear.svg')
                }
            });


        });
        reader.readAsDataURL(blob);
    }
}

function toggleMicFeedback() {
    if (micFeedback) {
        mic.disconnect(speakers);
        micFeedback = false;
    } else {
        mic.connect(speakers);
        micFeedback = true;
    }
}

function initMic() {

    if (!navigator.getUserMedia) {
        navigator.getUserMedia = navigator.getUserMedia
            || navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia
            || navigator.msGetUserMedia;
    }

    if (navigator.getUserMedia) {
        navigator.getUserMedia(
            {audio: true},

            //Success Callback
            function (stream) {
                var micSource = context.createMediaStreamSource(stream);

                // Create a biquadfilter to boost the bass
                var biquadFilter = context.createBiquadFilter();
                biquadFilter.type = "lowshelf";
                biquadFilter.frequency.value = 1000;
                biquadFilter.gain.value = 20;

                mic = micSource.connect(biquadFilter);
                micRecorder = new MediaRecorder(stream);

            },

            //Error Callback
            function (err) {
                console.log('error: ' + err);
            });
    } else {
        console.log('getUserMedia not supported in this browser!');
    }
}

/*
 EVENT HANDLERS
 */

$('#toggleFeedback').click(function () {
    toggleMicFeedback();
});

pad.hover(
    //Mouse Enter
    function () {
        //If there's nothing in the pad, show the mic icon
        if (recordedSounds[pad.index(this)] == undefined) {
            var micImage = this.children[0];
            micImage.style.visibility = 'visible';
        }
    },

    //Mouse leave
    function () {
        //If there's nothing in the pad, remove the mic icon
        if (recordedSounds[pad.index(this)] == undefined) {
            var micImage = this.children[0];
            micImage.style.visibility = 'hidden';
        }
    }
);

pad.click(function () {
    var index = pad.index(this);    //Index of pad to change
    var image = this.children[0];

    //No sample in pad yet, record one.
    if (recordedSounds[index] == undefined) {
        recordedSounds[index] = 'recording';
        $(image).attr("src", "images/mic-recording.svg");
        recordIntoPad(index);
    }
    //Sample in pad, clear it
    else {
        recordedSounds[index] = undefined;
        $(image).attr("src", "images/mic.svg");
    }
});

