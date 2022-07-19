// ==UserScript==
// @name          Runescape Chat Bubbles
// @description   add BUBBLES ABOVE UR BALLS
// @version       2.1
// @grant         none
// @match        *://*.koalabeast.com/*
// @match        *://*.jukejuice.com/*
// @match        *://*.newcompte.fr/*
// @author        Lej, Hjalpa
// @namespace     http://www.reddit.com/user/Lej
// @license       2015
// ==/UserScript==
var secondsToShowMessage = 3.0;
var maxCharacters = 25;

function addMessage(e, s, r) {
    removeMessage(e, !0), tagpro.players[e].lastMessageTime = Date.now(), s.length > maxCharacters && (s = jQuery.trim(s).substring(0, maxCharacters).slice(0, -1) + "..."), "team" == r ? 1 == tagpro.players[e].team ? fillColor = "#a71313" : 2 == tagpro.players[e].team && (fillColor = "#111197") : fillColor = "black", "@gre@" == s.substring(0, 5) ? (fillColor = "#92f3a0", s = s.slice(5)) : "@cya@" == s.substring(0, 5) ? (fillColor = "#92f3f0", s = s.slice(5)) : "@mag@" == s.substring(0, 5) ? (fillColor = "#f292f3", s = s.slice(5)) : "@ora@" == s.substring(0, 5) && (fillColor = "#f3d492", s = s.slice(5)), tagpro.players[e].sprites.bubbleText = new PIXI.Text(s, {
        font: "Bold 12px Helvetica",
        fill: fillColor,
        strokeThickness: 3,
        stroke: "white"
    }), tagpro.players[e].sprites.bubbleText.x = 20, tagpro.players[e].sprites.bubbleText.y = -38, tagpro.players[e].sprites.bubbleText.anchor.set(.5, .5), tagpro.players[e].sprites.ball.addChild(tagpro.players[e].sprites.bubbleText), setTimeout(function() {
        removeMessage(e)
    }, 1e3 * secondsToShowMessage)
}

function removeMessage(e, s) {
    (Date.now() - tagpro.players[e].lastMessageTime >= 1e3 * secondsToShowMessage || s) && tagpro.players[e].sprites.ball.removeChild(tagpro.players[e].sprites.bubbleText)
}
tagpro.ready(function() {
    tagpro.socket.on("chat", function(e) {
        e.from && addMessage(e.from, e.message, e.to)
    })
});