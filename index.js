var partial  = require('partial');
var hunspell = require('nodehun');
var unique   = require('unique-words');
var async    = require('async');

module.exports = checkChunk;

function checkChunk(nodehun, chunk, callback) {
    if (!(nodehun instanceof hunspell)) {
        return callback(new Error(
            'First argument to nodehun-sentences must be an instance of nodehun'
        ));
    }

    var words = unique(chunk
        .toString()
        .split(/\s+/)
        .map(trimWord)
        .map(splitWord)
    ).filter(function(i) {
        return i && i.length > 1;
    });

    var wordCheck = partial(checkWord)(nodehun);
    async.map(words, wordCheck, function(err, results) {
        if (err) {
            return callback(err);
        }

        callback(undefined, populatePositions(chunk, results));
    });
}

function populatePositions(text, words) {
    return words.filter(assertTrue).map(function(entry) {
        return populatePosition(text, entry);
    });
}

function populatePosition(text, entry) {
    var matcher = new RegExp('(?:\\W|^)' + escapeRegExp(entry.word) + '(?:\\W|$)', 'g');
    var match, wordLength = entry.word.length;

    entry.positions = [];
    while ((match = matcher.exec(text)) !== null) {
        entry.positions.push({
            from:   match.index + match[0].indexOf(entry.word),
            to:     match.index + wordLength,
            length: wordLength
        });
    }

    return entry;
}

function checkWord(nodehun, word, callback) {
    nodehun.spellSuggestions(word, function(validWord, suggestions) {
        if (validWord) {
            return callback();
        }

        callback(undefined, {
            word: word,
            suggestions: suggestions
        });
    });
}

function trimWord(word) {
    return word.replace(/^\W+|\W+$/g, '').replace(/^\d+$/, '');
}

function splitWord(word) {
    return word.replace(/\//g, ' ');
}

function assertTrue(i) {
    return i;
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
