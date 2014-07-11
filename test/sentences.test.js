var test = require('tape');
var checker = require('../');
var nodehun = require('nodehun');
var zlib = require('zlib');
var fs = require('fs');
var concat = require('concat-stream');

// Text to match against
var text = 'This chunk of text should contani exactly two distinct errors. \n';
    text += 'It contains the same words more than once; for exemple, \n';
    text += 'the word "exemple" is referenced twice.';

// Read dictionaries and run the tests when complete
readDictionary(runTests);

function runTests(err, aff, dic) {
    var instance = new nodehun(aff, dic);

    test('finds correct number of errors', function(t) {
        checker(instance, text, function(err, typos) {
            t.equal(typos.length, 2, 'should find 2 typos');
            t.end();
        });
    });

    test('finds the right typos', function(t) {
        checker(instance, text, function(err, typos) {
            t.equal(findTypo('contani', typos).word, 'contani', 'should find the "contani"-typo');
            t.equal(findTypo('exemple', typos).word, 'exemple', 'should find the "exemple"-typo');
            t.end();
        });
    });

    test('finds suggestions for typo', function(t) {
        checker(instance, text, function(err, typos) {
            var typo = findTypo('contani', typos);
            t.ok(typo.suggestions.length > 0, 'should contain some suggestions');
            t.ok(typo.suggestions.indexOf('contain') >= 0, 'should include "contain" as a suggestion');
            t.end();
        });
    });

    test('finds correct position for a single typo', function(t) {
        checker(instance, text, function(err, typos) {
            var typo = findTypo('contani', typos);
            var pos = (typo.positions || [])[0] || {};

            t.equal(text.substr(pos.from, pos.length), 'contani', 'substring should equal the typo');
            t.end();
        });
    });

    test('finds correct positions for a typo matched multiple times', function(t) {
        checker(instance, text, function(err, typos) {
            var typo = findTypo('exemple', typos);

            t.equal(typo.positions.length, 2, 'should contain two position objects');

            for (var i = 0, pos; i < typo.positions.length; i++) {
                pos = typo.positions[i];
                t.equal(text.substr(pos.from, pos.length), 'exemple', 'substring should equal the typo');
            }

            t.end();
        });
    });
}

function readDictionary(cb) {
    var aff, dic, remaining = 2;

    fs
        .createReadStream(__dirname + '/dictionaries/en_US.aff.gz')
        .pipe(zlib.createGunzip())
        .pipe(concat(function(data) {
            aff = data;
            if (--remaining === 0) { cb(null, aff, dic); }
        }));

    fs
        .createReadStream(__dirname + '/dictionaries/en_US.dic.gz')
        .pipe(zlib.createGunzip())
        .pipe(concat(function(data) {
            dic = data;
            if (--remaining === 0) { cb(null, aff, dic); }
        }));
}

// Typos are not guaranteed to be in the order they were found
// Simply lookup function to find the one we are looking for
function findTypo(word, typos) {
    for (var key in typos) {
        if (typos[key].word === word) {
            return typos[key];
        }
    }

    // Return empty object if not found
    return {};
}