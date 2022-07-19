// ==UserScript==
// @name         Funky Spud v2
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       Hjalpa
// @match        https://github.com/wilcooo/TagPro-UserscriptLibrary/wiki
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest.newcompte.fr:*
// @include       https://tagpro.koalabeast.com/game
// @include       https://bash-tp.github.io/tagpro-vcr/game*.html
// @include       http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==

audio.controls = false;
audio.volume = 0.6;
document.body.appendChild(audio);

// every second your audio element is playing
$(audio).on('timeupdate', function() {
    var vol = 1,
    interval = 200; // 200ms interval
    if (Math.floor(audio.currentTime) == 35) {
        if (audio.volume == 0.6) {
            var intervalID = setInterval(function() {
	        // Reduce volume by 0.05 as long as it is above 0
	        // This works as long as you start with a multiple of 0.05!
	        if (vol > 0) {
	            vol -= 0.05;
	            // limit to 2 decimal places
                    // also converts to string, works ok
                    audio.volume = vol.toFixed(2);
	        } else {
	            // Stop the setInterval when 0 is reached
	            clearInterval(intervalID);
	        }
            }, interval);
        }
    }
});

audio.play();