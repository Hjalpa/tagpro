// ==UserScript==
// @name            TagPro Ball Faces (Public Distribution Version)
// @version         1.0.1
// @description     Balls become emotional beings that react to their environment
// @include         http://tagpro-*.koalabeast.com:*
// @include         http://tangent.jukejuice.com:*
// @include         https://tagpro.koalabeast.com/game
// @include         http://*.newcompte.fr:*
// @author          Browncoat
// @maintainer      b1g
// @updateURL       https://gist.githubusercontent.com/bigbrotp/71f4b30d5c34b82ea4331f917045280b/raw/969054fd1011907350df68d2a37f93fcf526c4a9/tagpro_ball_faces.js
// @downloadURL     https://gist.githubusercontent.com/bigbrotp/71f4b30d5c34b82ea4331f917045280b/raw/969054fd1011907350df68d2a37f93fcf526c4a9/tagpro_ball_faces.js
// ==/UserScript==

/*

 TODO
    - Different eye colours
    - Eyebrows
    - kiss mouth
    - Sounds/honking
    - options menu
    - eye types (target, closed)
 */

/** @namespace player.lx */
/** @namespace player.ly */
/** @namespace player.dead */
/** @namespace player.draw */
tagpro.ready(function () {

    var tr = tagpro.renderer;

    var RED_TEAM = 1;
    var BLUE_TEAM = 2;
    var CLOSE_PLAYER_THRESHOLD = 250;
    var VERY_CLOSE_PLAYER_THRESHOLD = 50;

    var globalFlags = {redScored: false, blueScored: false};

    var eyeSocketTexture = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB2UlEQVQ4jX2TPU5bURCFvzn3PluuSLq4cEmdxqtAbIBN0LMC+myCDSBW4SY1pQuXwZWF3/ykeA6BJM6RrjTSnTM683OMP7Dd7i+lvJFqDba2grLakLbx1MNqdfH8Pt9+BVVlu93Lrcnue9PCzGjNoIwkqYRx9EMVd8vlp29mVm8FJvL+sXe76kOjSZgZZqeUSrKK8MI98Kin5fLi2sxKALvdy20f7GqYNXoTvYvZvDObD8zmnT7v9EG0WWOYd1rnard7uQWw7XZ/OfT6Pp/1RR8mch86kjBNHVYWmcXoTngyjs5x9MN41Ncu5Y26FtaFmhhmA2r6MFiT0WSUCbKo1oisRfTxRhLrZoasUGuYGefQW0ddoMLMEFoLWKs1JEOyN9lnYQaIU9paGFB12mX+nwwIMAowplLFpkgyIQuo8+QsyCwKo6oo2IhkE1EkRUbheV5FRRBZVBU5qd7IUw/heUgvIqYVuX8sUgUeiY9BRJCeRMTBXQ9arS6ex+IuPPDTpx9HXo9HfPTpHUfG1ykOT46RZHC3Wl08vzvlH4+t62o4nbJMYNPACqOyJhUehMfTl+XnazOrv8zUxL2aFtNKBfnbTJl+iPiHmd5ju91fduUNYk2xRkCdt/NPsdYl9oEJaIUAAAAASUVORK5CYII=");
    var eyePupilTexture = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAA00lEQVQYlW2PsU3DQBRA37/GcnyiOCE7ARcZwFIaQ5EqS0CVOcwOFmzhHdJaMEEiUBaITEDCRZQzV0R8ChAVb4H3ngDQaB5H1NayEMB7Wh+oWMpOaDRPna4vxrhRLAAMAbpX7d97mZkkop5McKeXJzY3V2xurzk9P3KZiUsiarKVdvOtqi1KBRRQW5Q636qmK+0M/yE/KkExhyPt8AnTuwdsUWKLkml1zxCUg5dWaDTPznU9TnHJb6QPsN/Tv30wk7/N0Vd9FpsFqhwHbX0wFUvZfQPv8VTJn0z26gAAAABJRU5ErkJggg==");
    var eyeShineTexture = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgUlEQVQ4jcWRsQ2EMBAEZ+nDKUSkVEPqNj74NiCkGlKyTynkPrFeBI+1goCVTrL27NGdF25KzqWIGIARSMAOLJJWC1Aev/+0XpLWxhhgrPkOINV8B7DXfAew1PzbKTyv3woR0QMZCGCWtDmA4ydmoAW6crZ0lkJcAUzAp9TsAp7XFxkTIBQxeQf6AAAAAElFTkSuQmCC");
    var eyeRadius = eyeSocketTexture.width / 2;

    var MouthType = {
        NEUTRAL: 1,
        SMILE: 2,
        FROWN: 3,
        BIG_SMILE: 4,
        OOO: 5,
        SCARED: 6
    };

    var mouthTextures = {};
    mouthTextures[MouthType.NEUTRAL] = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAgElEQVRYhe3QTQqBYRQF4Ofzk1CkFLZoDUZWYJMyUAyUkDC5C/ANjJynbu/k9N7TJSIiIiIiIuJ/NS2z7xb5LmaYYIAObjjXfPVXr8XCDdY4YI8H7nhiVCXmmGKJMS5V5okX+pXZYfvN0rYXXNUsMKxSTRW9VpkTjvVGRERE/NYH3NAWBmgX9CkAAAAASUVORK5CYII=");
    mouthTextures[MouthType.SMILE] = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAw0lEQVRYhe3PoUqDYRQG4EdnsaggGi1mEUHYkkFY8waMAwWjyQuYwVvwRrQ427YgggwEYTCWxmDZC7DMYBD+/fst8j7whQPfOe85RERERERERPyZWsF/N9jDe4XZVzhFr4phuxjhTvGjfrODB7xie8lZP2zhEQPUS/SvoYUJbud15VZwjinucVigZxWXGKODxqKBZWziGhcYoos3fGAD6zhAEyd4QRv9RYPKLvithjMc4wj7+Jy/MZ7wjNmSOREREf/VF3vpGuSkzHimAAAAAElFTkSuQmCC");
    mouthTextures[MouthType.FROWN] = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAm0lEQVRYhe3QoWpCARQG4E/EsIFBbdaVgWUWg9mncSaD+BrLe43lhQVBESyKeQ8ggn1o8D7AuFyHg/+DE8/Pfw4RERERERER/0LtXkIbGGGAIZ7QQhNnHIrZYYMVvvBz64KPmOIVeyyxwBYnHIvyHbTxgn5xxDM+8IZ1maK/Mcc7eiV2u5jgG5+uH6/cQwUZdYwxqyArIiIi/sAFbnQVZDjD3VsAAAAASUVORK5CYII=");
    mouthTextures[MouthType.BIG_SMILE] = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAu0lEQVRYhe3TMQ5BQRSF4Z9CoxBR2gCRiKhFIpTELmzCAmxHZw0WIFGg0FgAlYYCieYlx7vzKudLpruZ+08xYGZmZmZmZiEt4FHA6SjLy8LMSH7Kb6bKkBLYC4ZkGShDSmAzGJKlrQwpgcpMHjVlSFl+CoZkuaS6aEgxv3iRKhBglTDsDMxTxn2MgW0g7Pp+aLWIuG8zYA3cxbAjsATqeZaVAqENYAL0gS6vX1kBbsAB2AMbYBfYYWb29564r2Ns8l7B8wAAAABJRU5ErkJggg==");
    mouthTextures[MouthType.OOO] = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAWklEQVRYhe3TsQmAMBBA0Y/r3ei3gHvcANpYKKQRE5PiPwiBK45fJCBJkiRJkr4KIIG67pib8xTA0TjLRCbtwJwZdVe0A6vH8q3Djv3l/HfLv0FY/BdLkgY6AecZIIV9ymzfAAAAAElFTkSuQmCC");
    mouthTextures[MouthType.SCARED] = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAzElEQVRYhe3SMUoDURSG0aNhLBRLmxQ29vYuRZsswCKNXSC1axFdgRAQN5BWSKOiK5BgIcZiZhAskpnoxOY/cJuBy/t4b4iIiIiIiIjOHGGEezxhgTfMcIMBdv4jrIfLKmjVzHCyybhtXDWMq+cT55sKHLaMq+cDh13H7SlvY53ABe66Dhz8Iq5+6v02B/ZaBl7g+Me3F0wxwTVu8Yw5dqupbVWhk5bnNvbu+38a4aDBTh9jvFa7D13FUd7OKYo1dguc4fFPiyIiIpb6At/EXbXifGduAAAAAElFTkSuQmCC");

    var SpeedCategory = {
        VERY_SLOW: 1,
        SLOW: 2,
        FAST: 3
    };

    var createPlayerSprite = tr.createPlayerSprite;
    tr.createPlayerSprite = function (player) {
        createPlayerSprite(player);
        player.sprites.face = createFace();
        player.sprite.addChild(player.sprites.face);
    };

    var drawPlayer = tr.drawPlayer;
    tr.drawPlayer = function (player, context) {
        var drawPos = tr.getLockedPosition(player);
        drawPlayer(player, context);
        player.speed = getSpeed(player);
        player.speedCategory = getSpeedCategory(player);
        setFlags(player);
        updateFace(player);
        return drawPos;
    };

    var uiUpdate = tagpro.ui.update;
    var redScoreLastFrame = tagpro.score.r;
    var blueScoreLastFrame = tagpro.score.b;
    tagpro.ui.update = function () {
        uiUpdate();
        globalFlags.redScored = redScoreLastFrame < tagpro.score.r;
        globalFlags.blueScored = blueScoreLastFrame < tagpro.score.b;
        redScoreLastFrame = tagpro.score.r;
        blueScoreLastFrame = tagpro.score.b;
    };

    function setFlags(player) {
        var flags = player.sprites.face.flags;

        var powerupLastFrame = flags.powerup;
        flags.powerup = player.grip || player.tagpro || player.bomb;
        flags.powerupStart = !powerupLastFrame && flags.powerup;

        var flagLastFrame = flags.flag;
        flags.flag = player.flag;
        flags.flagStart = !flagLastFrame && flags.flag;

    }

    function updateFace(player) {
        // Create new animations if needed
        applyNewMouthAnimation(player);
        applyNewEyeAnimation(player);

        // Determine the dyanmic expression (based on player status and position)
        var dynamicExpression = getDynamicExpression(player);

        // Steps the animations if they exist, otherwise apply the dynamic expression
        updateEyes(player, dynamicExpression);
        updateMouth(player, dynamicExpression);
    }

    function applyNewMouthAnimation(player) {
        var face = player.sprites.face;
        if (face.flags.powerupStart) {
            console.log("got pup");
            face.mouthAnimation = {
                time: 1000,
                face: face,
                step: function () {
                    if (this.time > 500) {
                        this.face.mouth.setMouthType(MouthType.OOO);
                    } else {
                        this.face.mouth.setMouthType(MouthType.SMILE);
                    }
                },
                remove: function () {
                    this.face.mouthAnimation = null;
                }
            }
        } else if (face.flags.flagStart) {
            console.log("got flag");
            face.mouthAnimation = {
                time: 1000,
                face: face,
                step: function () {
                    if (this.time > 500) {
                        this.face.mouth.setMouthType(MouthType.BIG_SMILE);
                    } else {
                        this.face.mouth.setMouthType(MouthType.SMILE);
                    }
                },
                remove: function () {
                    this.face.mouthAnimation = null;
                }
            }
        } else if (player.team == RED_TEAM ? globalFlags.blueScored : globalFlags.redScored) {
            console.log("enemy scored");
            // Enemy Scored
            face.mouthAnimation = {
                time: 1000,
                face: face,
                step: function () {
                    if (this.time > 500) {
                        this.face.mouth.setMouthType(MouthType.SCARED);
                    } else {
                        this.face.mouth.setMouthType(MouthType.FROWN);
                    }
                },
                remove: function () {
                    this.face.mouthAnimation = null;
                }
            }
        } else if (player.team == BLUE_TEAM ? globalFlags.blueScored : globalFlags.redScored) {
            // Team scored
            console.log("team scored");
            face.mouthAnimation = {
                time: 1000,
                face: face,
                step: function () {
                    this.face.mouth.setMouthType(MouthType.BIG_SMILE);
                },
                remove: function () {
                    this.face.mouthAnimation = null;
                }
            }
        }
    }

    function applyNewEyeAnimation(player) {

    }

    function updateEyes(player, dynamicExpression) {
        if (player.sprites.face.eyeAnimation) {
            stepAnimation(player.sprites.face.eyeAnimation);
        } else {
            if (dynamicExpression.target == null) {
                lookInVelocityDirection(player);
            } else {
                lookAtPlayer(player, dynamicExpression.target);
            }
        }
    }

    function updateMouth(player, dynamicExpression) {
        if (player.sprites.face.mouthAnimation) {
            stepAnimation(player.sprites.face.mouthAnimation);
        } else {
            setMouthType(player, dynamicExpression.mouthType);
        }
    }

    function stepAnimation(animation) {
        if (animation.lastTime != undefined) {
            var now = new Date().getTime();
            animation.time -= (now - animation.lastTime);
            if (animation.time <= 0) {
                animation.remove();
            } else {
                animation.step();
            }
        }
        animation.lastTime = new Date().getTime();
    }

    function getDynamicExpression(player) {
        /*
        have flag
            closest player enemy
                rb+tp -> big smile
                rb -> smile
                tp -> ooo
                no rb or tp
                    enemy has flag -> ooo
                    enemy no flag -> scared
            closest player team mate -> smile
            no close players
                rb -> big smile
                no rb
                    fast -> big smile
                    slow -> smile
        don't have flag
            Enemy FC close -> ooo
            Enemy FC very close -> smile
            closest player team mate -> smile
            closest player enemy
                no tagpros -> neutral
                can kill enemy -> smile
                can be killed -> scared
                both tagpros -> ooo
            no close players
                fast -> big smile
                slow -> smile
         */

        var mouthType = MouthType.NEUTRAL;
        // var eyebrowType = EyebrowType.NEUTRAL
        var nearest = getNearestPlayerAndDistance(player);
        var nearestIsTeammate = nearest.player ? areTeammates(player, nearest.player) : false;
        var target = nearest.distance >= CLOSE_PLAYER_THRESHOLD ? null : nearest.player;
        if (player.flag) {
            // This player has a flag
            if (nearest.player && nearest.distance < CLOSE_PLAYER_THRESHOLD) {
                if (nearestIsTeammate) {
                    // Closest to a teammate
                    mouthType = MouthType.SMILE;
                } else {
                    // Closest to an enemy
                    if (player.bomb && player.tagpro) {
                        // This player has tp and rb
                        mouthType = MouthType.BIG_SMILE;
                    } else if (player.bomb) {
                        // This player has rb
                        mouthType = MouthType.SMILE;
                    } else if (player.tagpro) {
                        // This player has tp
                        mouthType = MouthType.OOO;
                    } else {
                        // This player has no rb or tp
                        if (target.flag) {
                            // Closest to enemy FC - possible kiss
                            mouthType = MouthType.OOO;
                        } else {
                            // Closest to enemy
                            if (nearest.distance < VERY_CLOSE_PLAYER_THRESHOLD) {
                                mouthType = MouthType.SCARED;
                            } else {
                                mouthType = MouthType.OOO;
                            }
                        }
                    }
                }
            } else {
                // This player has flag with no close players
                if (player.bomb) {
                    // This player has flag and rb
                    mouthType = MouthType.BIG_SMILE;
                } else {
                    if (player.speedCategory == SpeedCategory.FAST) {
                        // This player has flag and is going fast
                        mouthType = MouthType.BIG_SMILE;
                    } else {
                        // This player has flag and is going slow
                        mouthType = MouthType.SMILE;
                    }
                }
            }
        } else {
            // This player has no flag
            if (nearest.player && nearest.distance < VERY_CLOSE_PLAYER_THRESHOLD) {
                if (nearestIsTeammate) {
                    // Nearest player is teammate
                    mouthType = MouthType.SMILE;
                } else {
                    if (nearest.player.flag) {
                        // Nearest player is an enemy with flag
                        if (nearest.distance < VERY_CLOSE_PLAYER_THRESHOLD) {
                            // Very close to enemy FC
                            mouthType = MouthType.SMILE;
                        } else {
                            // Close to enemy FC
                            mouthType = MouthType.OOO;
                        }
                    } else {
                        // Nearest player is enemy with no flag
                        var canKillEnemy = player.tagpro && !target.bomb;
                        var canBeKilled = !player.bomb && target.tagpro;
                        if (!canKillEnemy && !canBeKilled) {
                            // Neither player can die from contact
                            mouthType = MouthType.NEUTRAL;
                        } else if (canKillEnemy && canBeKilled) {
                            // Both players could die from contact - tagpro kiss
                            mouthType = MouthType.OOO;
                        } else if (canKillEnemy) {
                            // This player can kill enemy
                            mouthType = MouthType.BIG_SMILE;
                        } else {
                            // Enemy can kill this player
                            if (nearest.distance < VERY_CLOSE_PLAYER_THRESHOLD) {
                                mouthType = MouthType.SCARED;
                            } else {
                                mouthType = MouthType.OOO;
                            }
                        }
                    }
                }
            } else {
                // This player has no flag and there are no close players
                if (player.speedCategory == SpeedCategory.FAST) {
                    mouthType = MouthType.BIG_SMILE;
                } else {
                    mouthType = MouthType.SMILE;
                }
            }
        }
        return {
            mouthType: mouthType,
            target: target
        };
    }

    function createFace() {
        var face = new PIXI.Container();
        face.x = 19;
        face.y = 19;

        var leftEye = createEye();
        leftEye.x = -8;
        leftEye.y = -8;
        face.addChild(leftEye);
        face.leftEye = leftEye;

        var rightEye = createEye();
        rightEye.x = 8;
        rightEye.y = -8;
        face.addChild(rightEye);
        face.rightEye = rightEye;

        var mouth = new PIXI.Sprite(mouthTextures[MouthType.NEUTRAL]);
        mouth.anchor.x = 0.5;
        mouth.anchor.y = 0.5;
        mouth.setMouthType = function (mouthType) {
            mouth.texture = mouthTextures[mouthType];
        };
        face.addChild(mouth);
        face.mouth = mouth;

        face.setEyesPosition = function (angle, distance) {
            this.leftEye.setPosition(angle, distance);
            this.rightEye.setPosition(angle, distance);
        };

        face.eyeAnimation = null;
        face.mouthAnimation = null;
        face.flags = { powerup: false, powerupStart: false, flag: false, flagStart: false };
        return face;
    }

    function createEye() {
        var eye = new PIXI.Container();
        var socket = new PIXI.Sprite(eyeSocketTexture);
        var pupil = new PIXI.Sprite(eyePupilTexture);
        var shine = new PIXI.Sprite(eyeShineTexture);
        socket.anchor.x = 0.5;
        socket.anchor.y = 0.5;
        pupil.anchor.x = 0.5;
        pupil.anchor.y = 0.5;
        shine.anchor.x = 0.5;
        shine.anchor.y = 0.5;
        eye.addChild(socket);
        eye.addChild(pupil);
        eye.addChild(shine);
        eye.socket = socket;
        eye.pupil = pupil;
        eye.shine = shine;
        eye.setPosition = function (angle, distance) {
            this.pupil.position.x = Math.cos(angle) * (distance * eyeRadius);
            this.pupil.position.y = Math.sin(angle) * (distance * eyeRadius);
        };
        return eye;
    }

    function getAllPlayers() {
        var players = [];
        for (var playerId in tagpro.players) {
            if (tagpro.players.hasOwnProperty(playerId)) {
                players.push(tagpro.players[playerId]);
            }
        }
        return players;
    }

    function getNearestPlayerAndDistance(player, players) {
        players = players || getAllPlayers();
        var closestDistance = 0;
        var closestPlayerIndex = -1;
        for (var i = 0; i < players.length; i++) {
            var otherPlayer = players[i];
            if (otherPlayer.id != player.id && otherPlayer.draw && !otherPlayer.dead) {
                var xd = player.x - otherPlayer.x;
                var yd = player.y - otherPlayer.y;
                var distance = Math.sqrt(xd * xd + yd * yd);
                if (closestPlayerIndex == -1 || distance < closestDistance) {
                    closestDistance = distance;
                    closestPlayerIndex = i;
                }
            }
        }
        if (closestPlayerIndex == -1) {
            return {
                player: null,
                distance: 0
            };
        } else {
            return {
                player: players[closestPlayerIndex],
                distance: closestDistance
            };
        }
    }

    function lookAtPlayer(looker, target) {
        lookAtPosition(looker, target.x, target.y);
    }

    function lookNeutral(player) {
        player.sprites.face.setEyesPosition(0, 0);
    }

    function lookAtPosition(player, x, y) {
        var xd = x - player.x;
        var yd = y - player.y;
        var angle = Math.atan2(yd, xd);
        lookAtAngle(player, angle);
    }

    function lookAtAngle(player, angle, distance) {
        player.sprites.face.setEyesPosition(angle, distance || 0.5);
    }

    function lookInVelocityDirection(player) {
        if (player.speedCategory == SpeedCategory.VERY_SLOW) {
            lookNeutral(player);
        } else {
            var xs = player.lx;
            var ys = player.ly;
            var angle = Math.atan2(ys, xs);
            var distance = player.speedCategory == SpeedCategory.SLOW ? 0.3 : 0.6;
            lookAtAngle(player, angle, distance);
        }
    }

    function setMouthType(player, mouthType) {
        player.sprites.face.mouth.setMouthType(mouthType);
    }

    function areTeammates(player1, player2) {
        return player1.team == player2.team;
    }

    function getSpeed(player) {
        return Math.sqrt(player.lx * player.lx + player.ly * player.ly);
    }

    function getSpeedCategory(player) {
        var speed = getSpeed(player);
        if (speed < 1) {
            return SpeedCategory.VERY_SLOW;
        } else if (speed < 6) {
            return SpeedCategory.SLOW;
        } else {
            return SpeedCategory.FAST;
        }
    }

});