'use strict';

var fs = require('fs');
var spellcheck = require('../');
var nodehun = require('nodehun');
var hunspell = new nodehun(
    fs.readFileSync(__dirname + '/../node_modules/nodehun/examples/dictionaries/en_US/en_US.aff'),
    fs.readFileSync(__dirname + '/../node_modules/nodehun/examples/dictionaries/en_US/en_US.dic')
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
