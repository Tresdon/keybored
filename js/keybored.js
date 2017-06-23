/**
 * Created by tjones on 3/7/17.
 */
var context = undefined;
var speakers = undefined;
var mic = undefined;
var micRecorder = undefined;

var sounds = [];
var soundNames = [];
var recordedSounds = [];

var keysUsed = "1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./";

var recordingDuration = 1000;
var BPM = 120;
var outputVolume = 0.7;

var micFeedback = false;
var sequencerOn = false;

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

    // Load different sounds
    var progressBar = $(".progress-bar")[0];
    for (var i = 0; i < soundNames.length; i++) {
        sounds[i] = new Howl({
            src: [soundNames[i]],
            volume: outputVolume
        });
        var percentComplete = parseInt(i / (soundNames.length - 1) * 100);
        progressBar.style.width = percentComplete + "%";
        if (percentComplete == 100) {
            $(".progress").fadeOut("slow", "swing");
            setTimeout(function () {
                //introJs().start();
            }, 2000)
        }
    }

    //Listen for keypress
    document.addEventListener('keydown', keyHandler);

    //Generate list of pads in DOM
    pads = $("#pads").children().find(".pad");

    //Request mic access
    initMic();

    //Init empty sequencer
    for (var beat = 0; beat < 32; beat++) {
        sequencedSounds[beat] = [];
    }

    //Init Sequencer Drawing
    initSequencer();
}



