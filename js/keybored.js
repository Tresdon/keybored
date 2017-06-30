/**
 * Created by tjones on 3/7/17.
 */
var context = undefined;
var speakers = undefined;

var sounds = [];
var soundNames = [];
var recordedSounds = [];
var images = [];

var keysUsed = "1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./";

var recordingDuration = 1000;
var BPM = 120;
var outputVolume = 0.7;
var loadedCount = 0;

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
    for (var i = 0; i < soundNames.length; i++) {
        sounds[i] = new Howl({
            src: [soundNames[i]],
            volume: outputVolume,
            onload: function () {
                updateProgress();
            }
        });
    }

    //Preload images
    preloadImages();

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

function updateProgress() {
    loadedCount += 1;
    var progressBar = $(".progress-bar")[0];
    var totalToLoad = soundNames.length + images.length;
    var percentComplete = parseInt((loadedCount / totalToLoad) * 100);
    progressBar.style.width = percentComplete + "%";
    if (percentComplete == 100) {
        $(".progress").fadeOut("slow", "swing");
        setTimeout(function () {
            //Show the user tutorial if they've never been here before.
            if(localStorage.getItem('visited') == null){
                introJs().start();
                localStorage.setItem('visited', true);
            }
        }, 2000)
    }
}

function preloadImages() {
    images = [
        'media_control_icons/metronome-black.svg',
        'media_control_icons/metronome-yellow.svg',
        'media_control_icons/pause-blue.svg',
        'media_control_icons/play-green.svg',
        'media_control_icons/record-red.svg',
        'media_control_icons/stop-red.svg',
        'clear.svg',
        'github-dark.png',
        'github-light.png',
        'mic-recording.svg',
        'mic.svg'
    ];


    for(var i = 0; i < images.length; i++){
        var image = new Image();
        image.onload = function () {
            updateProgress();
        };
        image.src = 'images/' + images[i];
    }
}


