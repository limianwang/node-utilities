node-utitlies
=============
a generic utilities library for node.js

[![Build Status](https://travis-ci.org/limianwang/node-utitlies.svg?branch=master)](https://travis-ci.org/limianwang/node-utitlies)

# Installation

Install and use it via npm + git.

`npm install git+ssh://git@github.com:limianwang/node-utitlies.git --save`

# Usage

Clone: Clone an object

```javascript
var util = require('./');

var obj = {
  key: 'value',
  key2: {
    field : ['a','b']
  }
};

var cloned = util.clone(obj);
```

Merge: Merge two objects together

```javascript
var util = require('./');

var a = {
  a: 'b'
};

var b = {
  b: 'c'
};

var out = util.merge(a, b);
```

# Tests

All tests are within `tests`. Run using `npm test`, or use `npm run-script coverage` for test coverage.
