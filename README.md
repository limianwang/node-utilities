node-utilities
=============
a generic utilities library for node.js

[![Build Status](https://travis-ci.org/limianwang/node-utilities.svg?branch=master)](https://travis-ci.org/limianwang/node-utilities)
[![Coverage Status](https://img.shields.io/coveralls/limianwang/node-utilities.svg)](https://coveralls.io/r/limianwang/node-utilities?branch=master)

# Installation

Install and use it via npm + git.

`npm install git+ssh://git@github.com:limianwang/node-utilities.git --save`

# Usage

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

### Memoize: memoize function responses

```javascript
var util = require('./');

function echo(i) {
  return i;
}

var cache = memoize(echo);

cache(1);
cache(1); // returns from cache
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

util.unique()
  .then(function(token) {
    console.log(token);
  })
  .catch(function(err) {
    // some error happened;
    console.log(err);
  });

// or allow prefix.

util.unique('someprefix')
  .then(function(token) {
    console.log(token); // someprefix:<unique>
  })
  .catch(function(err) {
    assert(err);
  });
```

### Encrypt Sensitive Information (using `bcrypt`)

Supports Promises and traditional node callback style.

```javascript
var util = require('./');

util.hash('password')
  .then(function(hashed) {
    console.log(hashed);
  })
  .catch(function(err) {
    console.log(err);
  });
  
util.compare('password', hashed)
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

util.defer(100)
  .then(function() {
    console.log('this happened 100 ms later!');
  });

console.log('this happens immediately!');
```

# Tests

All tests are within `tests`. Run using `npm test`, or use `npm run-script coverage` for test coverage.
