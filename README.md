node-helper-utilities
=============
a generic utilities library for node.js

[![Build Status](https://travis-ci.org/limianwang/node-utilities.svg?branch=master)](https://travis-ci.org/limianwang/node-utilities)
[![Coverage Status](https://img.shields.io/coveralls/limianwang/node-utilities.svg?style=flat-square)](https://coveralls.io/r/limianwang/node-utilities?branch=master)
[![github-tag](http://img.shields.io/github/tag/limianwang/node-utilities.svg?style=flat-square)](https://github.com/limianwang/node-utilities/releases)
[![npm](https://img.shields.io/npm/dm/node-helper-utilities.svg?style=flat-square)](https://www.npmjs.com/package/node-helper-utilities)
[![npm](https://img.shields.io/npm/v/node-helper-utilities.svg?style=flat-square)](https://www.npmjs.com/package/node-helper-utilities)
[![Dependency Status](https://david-dm.org/limianwang/node-utilities.svg?style=flat-square)](https://david-dm.org/limianwang/node-utilities)
[![devDependency Status](https://david-dm.org/limianwang/node-utilities/dev-status.svg?style=flat-square)](https://david-dm.org/limianwang/node-utilities#info=devDependencies)

# Installation

Install and use it via npm.

`npm install node-helper-utilities --save`

# Usage

### Clean: Filter out all non-true values

```js
var util = require('./');

var obj = {
  a: false,
  b: true
};

var b = util.clean(obj);
console.log(b);
//  {
//    b: true
//  }
```

### Clone: Clone an object

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

### Merge: Merge two objects together

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

### Cluster: Helper to start process in a cluster.

Takes optional `config` as follow:

```json
{
  "enable": true,
  "instances": 5
}
```

By default, the `instances` is set to (Max CPUs - 1).

```javascript
var util = require('./');
var http = require('http');

function start() {
  http.createServer(function(req, res) {}).listen(3000);
}
util.cluster(function() {
  // start server...
  start();
});

// Or using configs.

util.cluster(config, function() {
  // start server...
  start();
});
```

### Token: Token creator

Create uniquely generated tokens.

```javascript
var util = require('./');

util
  .unique()
  .then(function(token) {
    console.log(token);
  })
  .catch(function(err) {
    // some error happened;
    console.log(err);
  });

// or allow prefix.

util
  .unique('someprefix')
  .then(function(token) {
    console.log(token); // someprefix:<unique>
  })
  .catch(function(err) {
    assert(err);
  });
```

### Encrypt Sensitive Information (using `bcrypt`)

```javascript
var util = require('./');

util
  .hash('password')
  .then(function(hashed) {
    console.log(hashed);
  })
  .catch(function(err) {
    console.log(err);
  });

util
  .compare('password', hashed)
  .then(function(result) {
    console.log(result);
  })
  .catch(function(err) {
    console.log(err);
  });
````

### Defer

Defer a function to a later time (default: 0 ms, ie. _next_ iteration)

```js
var util = require('./');

util
  .defer(100)
  .then(function() {
    console.log('this happened 100 ms later!');
  });

console.log('this happens immediately!');
```

### Parse JSON

Often when you deal with async processes and have to pass data as JSON around, there is always potential for errors.
This function is to parse json safely, and return a promise.

```js
var util = require('./');
var couldBeJSONcouldBeString = ...;

util
  .parse(couldBeJSONcouldBeString)
  .then(function(parsed) {
    // parsed version of `couldBeJSONcouldBeString`
    console.log(parsed);
  })
  .catch(function(err) {
    // handle error here
    console.log(err);
  });
```

### Read and Write File

```js
var util = require('./');

var path = 'some_path';

util
  .write(path, 'hello world!')
  .then(function() {
    return util.read(path);
  })
  .then(function(data) {
    console.log(data); // hello world!
  })
  .catch(function(err) {
    console.log(err.stack);
  });
```

### Padder

```js
var util = require('./');

var str = 'h';

var padded = util.padder(str, { prefix: 'x', length: 5 });

console.log(padded); // 'xxxxh'
```

# Tests

All tests are within `tests`.

Run tests using `make test` or `make test-cov` for test coverage.

TravisCI build is tested against:

  - `0.10`
  - `0.11`
  - `0.12`
  - `1.x`
  - `2.x`
  - `3.x`
  - `4.x`
