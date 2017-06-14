var pad = $('.pad');
var pads = [];


/*
 PAD STUFF
 */
function playSound(index) {
    //If no recorded sample, play default
    try{
        recordedSounds[index].play();
    } catch (e) {sounds[index].play()}
}

// What to do when a key is pressed. play the sound, light up the button.
function keyHandler(e) {
    var key = e.key.toLowerCase();
    var index = keysUsed.indexOf(key);

    try{
        playSound(index);
        lightUpPad(index);
    } catch (e){}

    if (recording) {
        sequence(currentBeat, index);
    }

}

function lightUpPad(index) {
    var pad = pads[index];

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
}

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
