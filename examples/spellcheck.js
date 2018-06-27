'use strict';

var fs = require('fs');
var path = require('path');
var spellcheck = require('../');
var Nodehun = require('nodehun');

var dictionaryPath = path.join(
    __dirname,
    '..',
    'node_modules',
    'nodehun',
    'examples',
    'dictionaries'
);

var hunspell = new Nodehun(
    fs.readFileSync(path.join(dictionaryPath, 'en_US.aff')),
    fs.readFileSync(path.join(dictionaryPath, 'en_US.dic'))
);

var text = 'This is some text we want to ceck for typos';

spellcheck(hunspell, text, function(err, typos) {
    console.log(typos);

    /* jshint -W030, eqeqeq: false */
    typos == [{
        word: 'ceck',
        suggestions: [
            'check',
            'neck',
            'deck',
            'peck'
            // ...
        ],
        positions: [{
            from: 29,
            to: 32,
            length: 4
        }]
    }];
});
