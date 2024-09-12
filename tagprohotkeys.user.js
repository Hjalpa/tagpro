// ==UserScript==
// @name          Map Keys to Switch Teams and Toggle Music
// @description   Switches teams and turns music and sounds on at the push of a button
// @version       1.0
// @include      https://tagpro*.koalabeast.com/game
// @include      https://tagpro*.koalabeast.com/game?*
// @author        ballparts, Hjalpa
// ==/UserScript==

//////// Define KeyCodes Here /////////

// I used this site to get key codes: https://keycode.info

// KeyCode for switch teams
var switchTeamsKeyCode = 219; // [

// KeyCode for music toggle
var musicToggleKeyCode = 221; // ]

// KeyCode for sounds toggle
var soundToggleKeyCode = 220; // \

// KeyCode for chat toggle
var chatToggleKeyCode = 189; // -

///////////////////////////////////////

/* globals tagpro, PIXI, jQuery, $, tinycolor, tpul */

function waitForInitialized(fn) {
    if (!tagpro) {
        setTimeout(function() {
            waitForInitialized(fn);
        }, 10);
    } else {
        fn();
    }
}

waitForInitialized(function() {
    tagpro.ready(function() {
        document.onkeydown = function(e) {
            if($('#chat').css('display') !== "block") {
                if(e.keyCode == switchTeamsKeyCode) {
                    $('#switchButton').click();
                    return;
                }

                if(e.keyCode == musicToggleKeyCode) {
                    $('#soundMusic').click();
                    return;
                }
                if(e.keyCode == soundToggleKeyCode) {
                    $('#soundEffects').click();
                    return;
                }
                if(e.keyCode == chatToggleKeyCode) {
                    $('#chatHistory').toggle();
                    return;
                }
            }
        }
    });
});
