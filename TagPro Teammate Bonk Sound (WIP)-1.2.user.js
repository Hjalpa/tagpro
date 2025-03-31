// ==UserScript==
// @name         TagPro Teammate Bonk Sound (WIP)
// @version      1.2
// @description  Plays different bonk sounds when players on the same team collide, based on 3 tiers of relative velocity.
// @author       Hjalpa
// @match        https://*.koalabeast.com/game
// @grant        none
// ==/UserScript==

/* globals tagpro, PIXI */
/* eslint-disable no-multi-spaces */

tagpro.ready(function() {
    console.log("Bonk Loaded!");

    // --- Configuration ---
    // !!! REPLACE PLACEHOLDER FOR BONK_FAST_URL !!!
    const BONK_VERY_SLOW_URL = "https://raw.githubusercontent.com/hjalpa/sounds/main/bonkslow.mp3"; // For relative velocity < 1
    const BONK_SLOW_URL      = "https://raw.githubusercontent.com/hjalpa/sounds/main/bonk2.mp3"; // For relative velocity 1 to < 6
    const BONK_FAST_URL      = "https://raw.githubusercontent.com/hjalpa/sounds/main/bonkfast.mp3"; // <-- Needs actual URL! For relative velocity >= 6

    const BONK_VOLUME = 0.6; // Adjust volume 0.0 to 1.0

    // Thresholds aligned with Ball Faces speed categories, applied to *relative* velocity
    const VELOCITY_THRESHOLD_SLOW = 1.0;
    const VELOCITY_THRESHOLD_FAST = 6.0;

    const PLAYER_RADIUS = 19;
    const COLLISION_DISTANCE = PLAYER_RADIUS * 2;
    const COLLISION_DISTANCE_SQUARED = COLLISION_DISTANCE * COLLISION_DISTANCE;

    // --- Sound Setup ---
    const bonkSoundVerySlow = new Audio(BONK_VERY_SLOW_URL);
    const bonkSoundSlow = new Audio(BONK_SLOW_URL);
    const bonkSoundFast = new Audio(BONK_FAST_URL);

    bonkSoundVerySlow.volume = BONK_VOLUME;
    bonkSoundSlow.volume = BONK_VOLUME;
    bonkSoundFast.volume = BONK_VOLUME;

    function playBonkVerySlow() {
        bonkSoundVerySlow.currentTime = 0;
        bonkSoundVerySlow.play().catch(e => console.error("Very Slow Bonk sound playback failed:", e));
    }
    function playBonkSlow() {
        bonkSoundSlow.currentTime = 0;
        bonkSoundSlow.play().catch(e => console.error("Slow Bonk sound playback failed:", e));
    }
    function playBonkFast() {
        bonkSoundFast.currentTime = 0;
        bonkSoundFast.play().catch(e => console.error("Fast Bonk sound playback failed:", e));
    }

    // --- Collision State Tracking ---
    let currentlyCollidingPairs = new Set();

    // --- Game Loop Hook ---
    const originalUpdateGraphics = tagpro.renderer.updateGraphics;

    tagpro.renderer.updateGraphics = function() {
        // Call the original function first
        originalUpdateGraphics.apply(this, arguments);

        const players = Object.values(tagpro.players);
        const newCollidingPairs = new Set();

        for (let i = 0; i < players.length; i++) {
            const playerA = players[i];
            if (!playerA || !playerA.draw || playerA.dead) continue;

            for (let j = i + 1; j < players.length; j++) {
                const playerB = players[j];
                if (!playerB || !playerB.draw || playerB.dead) continue;

                if (playerA.team === playerB.team) {
                    const dx = playerA.x - playerB.x;
                    const dy = playerA.y - playerB.y;
                    const distanceSquared = dx * dx + dy * dy;

                    if (distanceSquared < COLLISION_DISTANCE_SQUARED) {
                        const pairKey = [playerA.id, playerB.id].sort().join('-');
                        newCollidingPairs.add(pairKey);

                        if (!currentlyCollidingPairs.has(pairKey)) {
                            // --- Calculate Relative Velocity ---
                            const dvx = playerA.lx - playerB.lx;
                            const dvy = playerA.ly - playerB.ly;
                            const relativeVelocity = Math.sqrt(dvx * dvx + dvy * dvy);

                            // console.log(`Bonk! Players ${playerA.id} & ${playerB.id}. Relative Vel: ${relativeVelocity.toFixed(2)}`);

                            // --- Play Sound Based on Velocity Tier ---
                            if (relativeVelocity < VELOCITY_THRESHOLD_SLOW) {         // < 1
                                playBonkVerySlow();
                            } else if (relativeVelocity < VELOCITY_THRESHOLD_FAST) { // 1 to < 6
                                playBonkSlow();
                            } else {                                                  // >= 6
                                playBonkFast();
                            }
                        }
                    }
                }
            }
        }

        // Update the state for the next frame
        currentlyCollidingPairs = newCollidingPairs;
    };
});