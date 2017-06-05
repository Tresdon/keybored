function recordIntoPad(index) {
    var chunks = [];
    var imageToChange = pad[index].children[0];


    //Slight delay to start recording
    setTimeout(function () {
        micRecorder.start();
        setTimeout(function () {
            micRecorder.stop();
        }, recordingDuration);
    }, 700);

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


$('#toggleFeedback').click(function () {
    toggleMicFeedback();
});

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