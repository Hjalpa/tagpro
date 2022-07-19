// ==UserScript==
// @name          MLTP Live In Game 3 - nov - Hjalpa Edition
// @version       1.2.1
// @include       *://*.koalabeast.com/game*
// @include       *://*.koalabeast.com/groups*
// @include       *://*.jukejuice.com/groups*
// @include       *://*.newcompte.*/groups*
// @author        RonSpawnson, nov, Hjalpa, RonSpawnson
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

var scoreFontSize = "36px";
var timerFontSize = "36px";
var teamFontSize = "0px";

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
        hideElements();

        var redTeamScore = 0;
        var blueTeamScore = 0;
        var redTeamName = $.cookie("redTeamName");
        var blueTeamName = $.cookie("blueTeamName");

        var halfIndicator = "https://i.imgur.com/uUroG9M.png";
        // var scoreboardBanner = "https://i.imgur.com/wyx6vP6.png"; // PCC-style 4-6 "https://i.imgur.com/ql8e8oJ.png";
        // var scoreboardBanner = "http://i.imgur.com/Aa6KWtj.png"; // Spawnson-style 4-6 "http://imgur.com/UaBc4Vs.png";
        // var scoreboardBanner = "https://i.imgur.com/QYsfdML.png"; // PCC-style 4-6 transtime "https://i.imgur.com/nXdRace.png";
        // const scoreboardBanner = "https://i.imgur.com/jMDCLN1.png"; // PCC-style 4 blacktime;
        // const scoreboardBanner = "https://i.imgur.com/HWFxHRn.png"; // PCC-style 6 blacktime;
        // const scoreboardBanner = "https://i.imgur.com/JmYNNN8.png"; // PCC-style 4 blacktime playoff edition
        // const scoreboardBanner = "https://i.imgur.com/fLtwrS2.png"; // PCC-style 6 blacktime playoff edition;
        // Texture Pack if lost: https://i.imgur.com/6yNTWF9.png;
        const scoreboardBanner = "https://i.imgur.com/OeOfkjj.png"; // PCC-style 2 blacktime playoff edition;


        //Canvas

        var canvasWidth = 1920;
        var canvasHeight = 1080;
        var canvasLeft = 0; // -15
        var canvasTop = 22;

        //Scoreboard

        var scoreboardWidth = 900;
        var scoreboardHeight = 56;
        var scoreboardBotPos = 56;
        var scoreboardLineHeight = 36;

        var scoreboardTop = canvasTop + (canvasHeight-(scoreboardBotPos+scoreboardHeight));
        //var scoreboardLeft = canvasLeft + (0.5*canvasWidth-0.5*scoreboardWidth);
        const scoreboardLeft = canvasLeft + (0.5 * canvasWidth-0.5 * scoreboardWidth);

        //Scores

        var scoreWidth = 50;
        var scoreTopPos = 14;
        var redScoreLeftPos = 348;
        var blueScoreLeftPos = 502;

        var scoreTop = scoreboardTop + scoreTopPos;
        var redScoreLeft = scoreboardLeft + redScoreLeftPos;
        var blueScoreLeft = scoreboardLeft + blueScoreLeftPos;

        //Teams

        var teamWidth = 340;
        var teamTopPos = 16;
        var redTeamLeftPos = 4;
        var blueTeamLeftPos = 556;

        var teamTop = scoreboardTop + teamTopPos;
        var redTeamLeft = scoreboardLeft + redTeamLeftPos;
        var blueTeamLeft = scoreboardLeft + blueTeamLeftPos;

        var team1Image = "https://i.imgur.com/8BeHmmY.png"; // HGB
        var team2Image = "https://i.imgur.com/Sg1fVBe.png"; // THC

        var redImage = team1Image
        var blueImage = team2Image

        //Timer

        var timerWidth = 96;
        var timerTopPos = 14;
        var timerLeftPos = 402;

        var timerTop = scoreboardTop + timerTopPos;
        var timerLeft = scoreboardLeft + timerLeftPos;

        //Containers

        const redcontainerColor = "34, 5, 7, 0.9";
        const bluecontainerColor = "34, 5, 7, 0.9";

        //Half Indicators

        var indicatorWidth = 15;
        var indicatorHeight = 8;
        var indicatorTopPos = 4;
        var indicator1LeftPos = 433;
        var indicator2LeftPos = 452;
        var indicator3LeftPos = 471;
        var indicator4LeftPos = 490;
        var indicator5LeftPos = 509;
        var indicator6LeftPos = 528;
        var indicator7LeftPos = 547;

        var indicatorTop = scoreboardTop + indicatorTopPos;
        var indicator1Left = scoreboardLeft + indicator1LeftPos;
        var indicator2Left = scoreboardLeft + indicator2LeftPos;
        var indicator3Left = scoreboardLeft + indicator3LeftPos;
        var indicator4Left = scoreboardLeft + indicator4LeftPos;
        var indicator5Left = scoreboardLeft + indicator5LeftPos;
        var indicator6Left = scoreboardLeft + indicator6LeftPos;
        var indicator7Left = scoreboardLeft + indicator7LeftPos;


        //Score and Team Text

        var redFontElement = createFontElement(0, scoreFontSize);
        var blueFontElement = createFontElement(0, scoreFontSize);

        var selectedHalf = $.cookie("selectedHalf");
        var halves = ["g1h1", "g1h2", "g2h1", "g2h2", "g3h1", "g3h2"];
        var selectedHalfId = halves.indexOf(selectedHalf) + 1;
        var isReturnGame = selectedHalfId % 2 == 0;
        var redOffset = isNaN($.cookie(selectedHalf + ".RedScore")) ? 0 : parseInt($.cookie(selectedHalf + ".RedScore")),
            blueOffset = isNaN($.cookie(selectedHalf + ".BlueScore")) ? 0 : parseInt($.cookie(selectedHalf + ".BlueScore"));
        var prevGameRed = 0,
            prevGameBlue = 0;

        var initScoreFlag = false;
        if (isReturnGame) {
            let previous = halves[selectedHalfId - 2];
            prevGameRed = isNaN($.cookie(previous + ".RedScore")) ? 0 : parseInt($.cookie(previous + ".RedScore"));
            prevGameBlue = isNaN($.cookie(previous + ".BlueScore")) ? 0 : parseInt($.cookie(previous + ".BlueScore"));
            redTeamName += " (" + prevGameBlue + ")";
            blueTeamName += " (" + prevGameRed + ")";
//            redImage = blueImage;
//            blueImage = redImage;
        }

        var redTeamFontElement = createFontElement(redTeamName, teamFontSize);
        var blueTeamFontElement = createFontElement(blueTeamName, teamFontSize);
        var domain = ".koalabeast.com";
        //var domain = ".newcompte.fr";


        var element = document.getElementById("loadingMessage");
        var newElement = '<div style="position:absolute;"><div class="scoreboardBanner" style="position:absolute; z-index:2; left: ' + scoreboardLeft + 'px; top:' + scoreboardTop + 'px;;"> \
                              <img src="'+ scoreboardBanner + '" \> \
                          <div id="redcontainer" style="position:absolute; height:36px; width:340px; display: inline-block; z-index:2; background: linear-gradient(to bottom, rgba(' + redcontainerColor + ') 0%, rgba(0,0,0,0.6) 100%); top:880px; left: 514px;"></div>\
                          <div id="bluecontainer" style="position:absolute; display: inline-block; height:36px; width:340px; background: linear-gradient(to bottom, rgba(' + bluecontainerColor + ') 0%, rgba(0,0,0,0.6) 100%); z-index:2; top:880px; left:1066px;"></div> \
                          <div id="redlogo" style="position:absolute; left: 4px; bottom: 4px; z-index:3;"> <img id="redTeamImage" src= ' + redImage + ' style="height:36px" alt="Red Team"> \
                          </div> \
                          <div id="bluelogo" style="position:absolute; left: 556px; bottom: 4px; z-index:3;"> <img id="blueTeamImage" src= ' + blueImage + ' style="height:36px" alt="Blue Team"> \
                          </div> \
                          <div id="redScore" style="position:fixed; top:'+ scoreTop + 'px; left:'+ redScoreLeft + 'px; width:'+ scoreWidth + 'px; height:'+ scoreboardLineHeight + 'px; line-height:'+ scoreboardLineHeight + 'px"> \
                              ' + redFontElement + ' \
                          </div> \
                          <div id="blueScore" style="position:fixed; top:'+ scoreTop + 'px; left:'+ blueScoreLeft + 'px; width:'+ scoreWidth + 'px; height:'+ scoreboardLineHeight + 'px; line-height:'+ scoreboardLineHeight + 'px"> \
                              ' + blueFontElement + ' \
                          </div> \
                          <div id="redTeam" style="position:fixed; top:'+ teamTop + 'px; left:'+ redTeamLeft + 'px; width:'+ teamWidth + 'px; height:'+ scoreboardLineHeight + 'px; line-height:'+ scoreboardLineHeight + 'px"> \
                              ' + redTeamFontElement + ' \
                          </div> \
                          <div id="blueTeam" style="position:fixed; top:'+ teamTop + 'px; left:'+ blueTeamLeft + 'px; width:'+ teamWidth + 'px; height:'+ scoreboardLineHeight + 'px; line-height:'+ scoreboardLineHeight + 'px"> \
                              ' + blueTeamFontElement + ' \
                          </div> \
                          <div id="timer" style="position:fixed; top:'+ timerTop + 'px; left:'+ timerLeft + 'px; width:' + timerWidth + 'px; height:' + scoreboardLineHeight + 'px; line-height:' + scoreboardLineHeight + 'px"> \
                              12:00 \
                          </div> \
                          <div id="halfIndicator1" style="display:none; position:fixed; top:'+ indicatorTop + 'px; left:'+ indicator1Left + 'px; width:' + indicatorWidth + 'px; height:' + indicatorHeight + 'px; background-image: url(' + halfIndicator + ')"> \
                          </div> \
                          <div id="halfIndicator2" style="display:none; position:fixed; top:'+ indicatorTop + 'px; left:'+ indicator2Left + 'px; width:' + indicatorWidth + 'px; height:' + indicatorHeight + 'px; background-image: url(' + halfIndicator + ')"> \
                          </div></div>';

        element.insertAdjacentHTML('afterend', newElement);
        element = document.getElementsByTagName('head');
        newElement = "<link href='https://fonts.googleapis.com/css?family=Play' rel='stylesheet' type='text/css'>"
        element[0].insertAdjacentHTML('afterend', newElement);

        setupOnScoreFunction();
        fillInHalfIndicators(isReturnGame);

        // update timer text
        requestAnimationFrame(function updateTimerText() {
            requestAnimationFrame(updateTimerText);
            updateTimer();
        });

        function hideSpectatorInfo1() {
            if (tagpro.ui.sprites.spectatorInfo1 != undefined) {
                setTimeout(function() {tagpro.ui.sprites.spectatorInfo1.visible = false;}, 0);
            } else {
                setTimeout(hideSpectatorInfo1, 200);
            }
        }
        function hideSpectatorInfo2() {
            if (tagpro.ui.sprites.spectatorInfo2 != undefined) {
                setTimeout(function() {tagpro.ui.sprites.spectatorInfo2.visible = false;}, 0);
            } else {
                setTimeout(hideSpectatorInfo2, 200);
            }
        }
        function hideplayerIndicators() {
            if (tagpro.ui.sprites.playerIndicators != undefined) {
                setTimeout(function() {tagpro.ui.sprites.playerIndicators.visible = false;}, 0);
            } else {
                setTimeout(hideplayerIndicators, 200);
            }
        }
        function hideRedScore() {
            if (tagpro.ui.sprites.redScore != undefined) {
                setTimeout(function() {tagpro.ui.sprites.redScore.visible = false;}, 0);
            } else {
                setTimeout(hideRedScore, 200);
            }
        }
        function hideBlueScore() {
            if (tagpro.ui.sprites.blueScore != undefined) {
                setTimeout(function() {tagpro.ui.sprites.blueScore.visible = false;}, 0);
            } else {
                setTimeout(hideBlueScore, 200);
            }
        }
        function hideChat() {
            document.getElementById("chatHistory").style.display = "none";
        }
        function swapTeamImages() {
            $('#blueTeamImage').attr('src', redImage);
            $('#redTeamImage').attr('src', blueImage);

            var oldBlueImage = blueImage
            blueImage = redImage
            redImage = oldBlueImage
        }
        function onKeydown(evt) {
            // Use https://keycode.info/ to get keys
            if (evt.keyCode == 192) {
                swapTeamImages()
            }
    }
    document.addEventListener('keydown', onKeydown, true);

// Hiding UI Options. // to re-gain access to Exit URL and Volume Controls
        $('#sound').remove();
        $('#exit').remove();

        function hideElements() {
            hideSpectatorInfo1();
            hideSpectatorInfo2();
            hideplayerIndicators();
            hideRedScore();
            hideBlueScore();
            hideChat();
//            hideSoundEffects();
//            hideSoundMusic();
//            hideVolumeSlider();
//            hideExit();
        }

        function createFontElement(num, size) {
            return '<div style="text-align:center; font-weight:bold; font-variant: small-caps; color: rgba(255, 248, 231, 0.95); -webkit-text-stroke: 1px #000000; font-family:\'Helvetica\',sans-serif; font-size:' + size + '">' + num + '</div>';
        }
        function createFontElement2(num, size) {
            return '<div style="text-align:center; font-weight:bold; font-variant: small-caps; font-style: oblique; color: rgba(255, 248, 231, 0.3); font-family:\'Segoe UI\',sans-serif; font-size:' + size + '">' + num + '</div>';
        }
        function createFontElement3(num, size) {
            return '<div style="text-align:center; font-weight:bold; color: rgba(255, 248, 231, 0.95); -webkit-text-stroke-width: 0px; -webkit-text-stroke-color: #000000; font-family:\'Segoe UI\',sans-serif; font-size:' + size + '">' + num + '</div>';
        }

        function setupOnScoreFunction() {
            tagpro.socket.on('score', function(score) {
                updateScores(score);
            });
        }

        function updateScores(score) {
            let red = parseInt(score.r),
                blue = parseInt(score.b),
                invert = isReturnGame;
          //  if (selectedHalf.substring(0, 2) == 'g2') {
          //      invert = isReturnGame;
          //  }
            if (!initScoreFlag) {
                // avoids score incrementing when refreshing page or re-joining game after a cap is made
                redOffset -= invert ? blue : red;
                blueOffset -= invert ? red : blue;
                initScoreFlag = true;
            }
            let redScore = redOffset + prevGameBlue + parseInt(score.r),
                blueScore = blueOffset + prevGameRed + parseInt(score.b);
            document.getElementById("redScore").innerHTML = createFontElement2(redScore, scoreFontSize);
            document.getElementById("blueScore").innerHTML = createFontElement2(blueScore, scoreFontSize);

            // add new cookie
            var options = {
                domain: domain,
                path: '/'
            }
            $.cookie(selectedHalf + (invert ? ".BlueScore" : ".RedScore" ), redScore - prevGameBlue, options);
            $.cookie(selectedHalf + (invert ? ".RedScore" : ".BlueScore" ), blueScore - prevGameRed, options);
        }

        function fillInHalfIndicators(isReturnGame) {
            document.getElementById("halfIndicator1").style.display = "block";
            document.getElementById("halfIndicator2").style.display = isReturnGame ? "block" : "none";
        }

        function updateTimer() {
            document.getElementById("timer").innerHTML = createFontElement3(getTime(), timerFontSize);
        }

        function getTime() {
            const leadingZero = false;
            var time = tagpro.gameEndsAt - Date.now();
            var millis = Math.max(0, time);
            var min = ((leadingZero ? "00" : "") + Math.floor(time/6e4) ).slice(-2);
            var OTmin = (leadingZero ? "00" : "") + Math.abs(min) - 1;
            var sec = ( "00" + Math.floor(time%6e4/1e3) ).slice(-2);
            var OTsec = ("00" + Math.floor((Date.now() - tagpro.overtimeStartedAt) / 1000) % 60).slice(-2);
            var decis = Math.floor(time % 1e3 / 1e2);

            // var timeSinceOT = (Date.now() - tagpro.overtimeStartedAt )/1000;
            if (tagpro.state == 1 || tagpro.state == 3) {
				if (millis > 60000) {
					return min + ":" + sec;
				} else {
					return sec + "." + decis;
				}
			}
			else if (tagpro.state == 5) {
                return OTmin + ":" + OTsec;
			}
            else if (tagpro.state == 2) {
                return "0:00";

            }
            return org_timer(...arguments);
        }

        function fillInTeamNames() {
            $("#redTeam").html(createFontElement(redTeamName, teamFontSize));
            $("#blueTeam").html(createFontElement(blueTeamName, teamFontSize));
        }

        function fixSeconds(seconds) {
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return seconds;
        }

        function fixOTSeconds(seconds) {
            if (tagpro.state == 5) {
                if (seconds < 10) {
                seconds = "0" + OTsec;
            }
            return seconds;
        }}

        function overrideTimeoutOffset(obj) {
            updateScores(tagpro.score);
        }


        function createScoreObject(redScore, blueScore) {
            return "{r: " + redScore + ", b:" + blueScore + "}"
        }

    });

    //////////////////////////////////
    // JQUERY COOKIE PLUGIN FOLLOWS //
    //////////////////////////////////

    (function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD (Register as an anonymous module)
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {},
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling $.cookie().
			cookies = document.cookie ? document.cookie.split('; ') : [],
			i = 0,
			l = cookies.length;

		for (; i < l; i++) {
			var parts = cookies[i].split('='),
				name = decode(parts.shift()),
				cookie = parts.join('=');

			if (key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

});