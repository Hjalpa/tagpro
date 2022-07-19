// ==UserScript==
// @name          MLTP Live Boxscore - nov - Hjalpa Edition
// @version       1.21
// @include       *://*.koalabeast.com/groups*
// @include       *://*.jukejuice.com/groups*
// @include       *://*.newcompte.*/groups*
// @include       https://bash-tp.github.io/tagpro-vcr/*
// @author        RonSpawnson, nov, Hjalpa
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

var redHalfScoreBackgroundLoc = "https://i.imgur.com/sOlLi3d.png";
var redAggregateScoreBackgroundLoc = "https://i.imgur.com/PC8KvZU.png";
var blueHalfScoreBackgroundLoc = "https://i.imgur.com/sOlLi3d.png";
var blueAggregateScoreBackgroundLoc = "https://i.imgur.com/AC78sr1.png";

var boxscoreFontSize = "42px";
var boxscoreSize = "69px";
var boxscorePadding = "5px 5px 5px 0px";

var keys = [];
for (var i = 1; i < 4; i++) {
    keys.push(...['g'+i+'h1', 'g'+i+'h2', 'g'+i+'aggregate']);
}
var domain = ".koalabeast.com"
//var domain = ".newcompte.fr"
        
// Insert google font
var element = document.getElementsByTagName('head');
var newElement = "<link href='https://fonts.googleapis.com/css?family=Play' rel='stylesheet' type='text/css'>"
element[0].insertAdjacentHTML('afterend', newElement);
// Inject custom style
$("<style>")
    .prop("type", "text/css")
    .html("\
    .boxscore {\
        width: "+boxscoreSize +";\
        vertical-align: top;\
        padding: " + boxscorePadding +"; \
    }\
    .boxscore-entry {\
        height: "+boxscoreSize +";\
        line-height: "+boxscoreSize+";\
    }\
    .boxscore p {\
         margin: 0;\
         text-align:center;\
         font-weight:bold;\
         color:white; font-family:'Play';\
         font-size:" + boxscoreFontSize + ";\
    }")
    .appendTo("head");
initJqueryCookiePlugin();
createContainer();
createGameSelectorSection();
createBoxscoreSection();
loadBoxscores();
setupBoxscoreEventListeners();
setupTeamNameEventListeners();

function createContainer() {
    let players = $('#pub-players');
    let container = $("<div/>", {"class": "col-md-12 private-game private-settings", id: "boxscoreContainer"});
    container.insertBefore(players);
}

function createSelector(parent, name, options) {
    let selector = $("<select>", {name: name, "class": "form-control"}).appendTo(parent);
    $(options).each(function() {
        selector.append($("<option>").attr('value',this).text(this));
    });
    let choice = $.cookie(name);
    if (choice != undefined) {
        selector.val(choice);
    } else {  // initializes cookie
         $.cookie(name, "g1h1", {domain:domain, path: '/'});
    }
    selector.on('change', function() {
        $.cookie(name, this.value, {domain:domain, path: '/'});
    });
    return selector
}

function createGameSelectorSection() {
    let container = $("#boxscoreContainer");
    let gamesList = ["g1h1", "g1h2", "g2h1", "g2h2", "g3h1", "g3h2"];
    let gameSelector = createSelector(container, "selectedHalf", gamesList);

}
function createBoxscoreSection() {
    var element = document.getElementById("boxscoreContainer");
    var newElement = '<div id="boxscore" style="margin-top:20px"><table style="width:30%"> \
                          <tr>' + generateInputRow('Red') + '</tr> \
                          <tr>' + generateEntryRow('Red') + '</tr> \
                          <tr>' + generateEntryRow('Blue') + '</tr> \
                          <tr>' + generateInputRow('Blue') + '</tr> \
                     </table></div>';
    element.insertAdjacentHTML( 'beforeend', newElement );
}

function generateInputRow(color) {
    let out = '';
    $.each(keys, function(i, key) {
        out += generateBoxscoreInput(key + '.' + color + 'ScoreInput');
    });
    return out;
}

function generateEntryRow(color) {
    let out = '';
    $.each(keys, function(i, key) {
        out += generateBoxscoreEntry(key + '.' + color + 'Score');
    });
    return out;
}

function generateBoxscoreEntry(id) {
    let imageLoc = null,
        isRed = id.includes('Red'),
        isAggregate = id.includes('aggregate');
    if (isRed) {
        imageLoc = isAggregate ? redAggregateScoreBackgroundLoc : redHalfScoreBackgroundLoc;
    } else {
        imageLoc = isAggregate ? blueAggregateScoreBackgroundLoc : blueHalfScoreBackgroundLoc;
    }
    return '<td class="boxscore boxscore-entry"><div id="' + id + '" style="background-image: url(' + imageLoc + ');">' + createFontElement("", boxscoreFontSize) + '</div></td>';
}

function createFontElement(num, size) {
    num = $.isNumeric(num) ? num : "-";
    return '<p>' + num + '</p>';
}

function generateBoxscoreInput(id) {
    var disabledSection = id.includes("aggregate");
    return '<td class="boxscore"><div class="boxscoreInput chat-input"><input type="text" id=' + id + ' name="' + id + '" value="" style="width:'+boxscoreSize+';text-align:center" ' + disabledSection + '></div></td>';
}

function setupTeamEntryEventListeners() {
    $(".teamNameInput").change(overrideTeamName);
}

function overrideTeamName(obj) {
    var name = obj.target.name;
    var value = obj.target.value; 
    
    
    // add new cookie
    var options = {
        domain: domain,
        path: '/'
    }
    $.cookie(name, value, options);
}

function setupBoxscoreEventListeners() {
    $(".boxscoreInput").change(overrideBoxscore);
}

function setupTeamNameEventListeners() {
    let elems = ["redTeamName", "blueTeamName"];
    $(elems).each(function () {
        let input = $("input[name="+ this + "]");
        let name = this;
        saveTeamNames();
    });
    tagpro.group.socket.on('setting',function(setting) {
        if (setting.name == 'redTeamName' || setting.name == 'blueTeamName') {
            saveTeamNames();
        }
    });
}
function overrideBoxscore(obj) {
    // Remove "input" from id and escape period
    var nameWithoutInput = obj.target.name.replace("Input", "");
    
    var sections = nameWithoutInput.split(".");
    var period = sections[0];
    var teamColor = sections[1].replace("Score", "");
    
    nameWithoutInput = period + "." + teamColor + "Score";
    
    var name = nameWithoutInput.replace(".", "\\.");
    
    $("#" + name).html(createFontElement(obj.target.value, boxscoreFontSize));

    // add new cookie
    var options = {
        domain: domain,
        path: '/'
    }

    //console.log("replacing " + nameWithoutInput + " with " + obj.target.value);
    $.cookie(nameWithoutInput, obj.target.value, options);
    loadBoxscores();
}

function loadBoxscores() {
    for (var game = 1; game < 4; game++) {
        for (var half = 1; half < 3; half++) {
            updateScore("Red", game, half);
            updateScore("Blue", game, half);
        }
        // calculate aggregate
        updateAggregate("Red", game);
        updateAggregate("Blue", game);
    }
    
    setupBoxscoreEventListeners();
}

function updateScore(teamColor, game, half) {
    var scoreName = "g" + game + "h" + half + "." + teamColor + "Score";
    var score = $.cookie(scoreName);   

    if (score != undefined) {
        // escape period
        var escapedScoreName = scoreName.replace(".", "\\.");

        // update score
        $("#" + escapedScoreName).html(createFontElement(score, boxscoreFontSize));
        //console.log("Setting " + teamColor + " score to " + score);
        
        // update score input
        $("#" + escapedScoreName + "Input").val(score);
    }
}

function updateAggregate(teamColor, game) {
    var aggregateScoreName = "g" + game + "aggregate." + teamColor + "Score";
  
    var score = ""; // starts blank
    for (var half = 1; half < 3; half++) {
        // If either half scores are undefined for this game, exit
        if (($.cookie("g" + game + "h1" + "." + teamColor + "Score") == undefined) || ($.cookie("g" + game + "h2" + "." + teamColor + "Score") == undefined)) {
            continue;
        }
        var halfScore = $.cookie("g" + game + "h" + half + "." + teamColor + "Score");

        if (halfScore != undefined) {
            // If we are saving a score and the score is blank, set it to 0.
            if (score == "") {
                score = 0;
            }
            score = score + parseInt(halfScore); 
        }
    }
    var escapedScoreName = aggregateScoreName.replace(".", "\\.");
    $("#" + escapedScoreName).html(createFontElement(score, boxscoreFontSize));
    
    // persist aggregate score to cookie
    var options = {
        domain: domain,
        path: '/'
    }
    
    $.cookie(aggregateScoreName, score, options);
    
}

function saveTeamNames() {
    let elems = ["redTeamName", "blueTeamName"];
    $(elems).each(function () {
        let input = $("input[name="+ this + "]");
        let name = this;
        $.cookie(name, input.val(), {domain:domain, path: "/"});
    });
}
//////////////////////////////////
// JQUERY COOKIE PLUGIN FOLLOWS //
//////////////////////////////////
function initJqueryCookiePlugin() {

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
}
