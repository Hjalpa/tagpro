// ==UserScript==
// @name          TagPro player-specific sounds based on event
// @namespace     Poeticalto
// @description   Plays a desired sound when a specific player joins the game
// @include       https://tagpro*.koalabeast.com/game
// @include       https://tagpro*.koalabeast.com/game?*
// @include       http*://tangent.jukejuice.com:*
// @include       http*://maptest*.newcompte.fr:*
// @include       https://bash-tp.github.io/tagpro-vcr/*
// @include   https://*.parretlabs.xyz/flagtag/
// @author        Poeticalto
// @version       0.1
// ==/UserScript==

// Note: If you are using "big" files, it may be better to "preprocess" audio files by doing
// the player check when they join and assigning different audio elements to them. It might
// be better/more efficient like that anyways, this was just a first pass at the idea.
// format: [soundURL, volume]

const playerData = {
    "Poeticalto": ["https://themushroomkingdom.net/sounds/wav/smb/smb_1-up.wav",1.0],
    "some ball": ["https://raw.githubusercontent.com/hjalpa/sounds/main/cheering.mp3"],
    "ttv/Hjalpa": ["https://raw.githubusercontent.com/hjalpa/sounds/main/wassup-baby.mp3"],
    "spacetiger": ["https://raw.githubusercontent.com/hjalpa/sounds/main/spacetiger.mp3"],
    "jazzz": ["https://raw.githubusercontent.com/hjalpa/sounds/main/jazzztrue.mp3"],
    "DiNgBaT": ["https://raw.githubusercontent.com/hjalpa/sounds/main/dingbat.mp3"],
    "Acuraun": ["https://raw.githubusercontent.com/hjalpa/sounds/main/acaraun.mp3"],
    "BertAndBort": ["https://raw.githubusercontent.com/hjalpa/sounds/main/bertandbort.mp3"],
    "wet bat": ["https://raw.githubusercontent.com/hjalpa/sounds/main/wetbattrue.mp3"],
    "Prime": ["https://raw.githubusercontent.com/hjalpa/sounds/main/primetrue.mp3"],
    "DudeMcGuy": ["https://raw.githubusercontent.com/hjalpa/sounds/main/dudemcguy.mp3"],
    "Raja": ["https://raw.githubusercontent.com/hjalpa/sounds/main/youre-ugly.mp3"],
    "scorch": ["https://raw.githubusercontent.com/hjalpa/sounds/main/icq2008_incomingim.mp3"],

};

tagpro.ready(function(){
    // dummy object for comparing number of caps
    let dummyPlayers = {};
    for (let x in tagpro.players) {
        dummyPlayers[tagpro.players[x].name] = 0;
    }
    // element holding sound to play
    const playerSound = document.createElement('audio');
    playerSound.preload = "auto";
    // note that the score event may fire at non-capture times
    // so it is important to handle those "mis-fires" as well
	tagpro.socket.on("score", function(message) {
        // interrupt the default sound and reset so it doesn't mess up future playback
        document.getElementById("cheering").pause();
        document.getElementById("cheering").currentTime = 0;
        document.getElementById("sigh").pause();
        document.getElementById("sigh").currentTime = 0;
        // add timeout before checking tagpro object for changed data
        let waitTimeout = tagpro.ping.avg + 30;
        window.setTimeout( function() {
            for (let x in tagpro.players) {
                // player data to check from tagpro object
                let pName = tagpro.players[x].name;
                let pCaps = tagpro.players[x]["s-captures"];
                if (! (pName in dummyPlayers))
                {
                    dummyPlayers[pName] = 0;
                    continue;
                }
                if (dummyPlayers[pName] !== pCaps)
                {
                    dummyPlayers[pName] = pCaps;
                    // if the playerSound element is currently playing,
                    // stop and reset to play a new sound
                    // Note this behavior can be done in different ways
                    if (!playerSound.paused)
                    {
                        playerSound.pause();
                        playerSound.currentTime = 0;
                    }

                    // check playerData object for the correct sound to play
                    if (playerData[pName])
                    {
                        playerSound.src = playerData[pName][0];
                        playerSound.volume = (playerData[pName].length > 1 ? playerData[pName][1] : 1);
                        playerSound.play();
                    }
                    else if (playerData["some ball"])
                    {
                        playerSound.src = playerData["some ball"][0];
                        playerSound.volume = (playerData["some ball"].length > 1 ? playerData["some ball"][1] : 1);
                        playerSound.play();
                    }
                }
            }
        }, waitTimeout);
    });
});