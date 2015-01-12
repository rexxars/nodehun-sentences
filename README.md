# nodehun-sentences

[![Version npm](http://img.shields.io/npm/v/nodehun-sentences.svg?style=flat-square)](http://browsenpm.org/package/nodehun-sentences)[![Build Status](http://img.shields.io/travis/rexxars/nodehun-sentences/master.svg?style=flat-square)](https://travis-ci.org/rexxars/nodehun-sentences)[![Dependencies](https://img.shields.io/david/rexxars/nodehun-sentences.svg?style=flat-square)](https://david-dm.org/rexxars/nodehun-sentences)[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/rexxars/nodehun-sentences.svg?style=flat-square)](https://codeclimate.com/github/rexxars/nodehun-sentences)[![Code Climate](http://img.shields.io/codeclimate/github/rexxars/nodehun-sentences.svg?style=flat-square)](https://codeclimate.com/github/rexxars/nodehun-sentences/)

[nodehun](https://github.com/nathanjsweet/nodehun) is a great library for interacting with [hunspell](http://hunspell.sourceforge.net/) from node.js. It's fairly low-level, however, letting you check one word at a time. `nodehun-sentences` lets you easily check whole sentences or chunks of text for errors.

It asynchronously checks all the words and returns with a result array containing all the encountered typos. For each typo, you will also get an array of all the positions within the string where the typo was encountered, so you can easily visualize all errors.

# Installation

```bash
$ npm install --save nodehun-sentences
```

# Usage

```js
var spellcheck = require('nodehun-sentences');
spellcheck(nodehunInstance, textToCheck, function(err, typos) {
    // NOTE: `err` does NOT contain whether typos was found -
    // it returns any actual *errors* (not being passed a
    // valid instance of nodehun, for instance)
    if (err) {
        throw err;
    }

    // `typos` is an array of all typos, each one an object containing:
    //   - `word`: the word which was concidered a typo (string)
    //   - `suggestions`: list of suggestions (array of strings)
    //   - `positions`: list of positions where the typo was found (array of objects)
    typos.forEach(function(typo) {
        console.log('"' + typo.word + '" is not a valid word');
        console.log('found ' + typo.positions.length + ' occurences')
    });

    // Each entry in `typo.positions` contains the following keys:
    //   - `from`: The start offset for the typo within the text (integer)
    //   - `to`: The end offset for the typo within the text (integer)
    //   - `length`: Word length (integer)
    textToCheck.substring(typo[0].from, typo[0].to) === typo[0].word;
});
```

Taken from `examples/spellcheck.js`:

```js
var fs = require('fs');
var spellcheck = require('nodehun-sentences');
var nodehun = require('nodehun');
var hunspell = new nodehun(
    fs.readFileSync('path/to/dictionary.aff'),
    fs.readFileSync('path/to/dictionary.dic')
);

var text = 'This is some text we want to ceck for typos';

spellcheck(hunspell, text, function(err, typos) {
    if (err) {
        throw err;
    }

    console.log(typos);

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
            to: 33,
            length: 4
        }]
    }];
});

```

# License

MIT-licensed. See LICENSE.
