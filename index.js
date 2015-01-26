
'use strict';

var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var os = require('os');
var cluster = require('cluster');
var slice = Array.prototype.slice;

function clone(obj) {
  var copy;

  if('object' === typeof obj && !!obj) {
    if(Array.isArray(obj)) {
      copy = [];
      obj.forEach(function(element, index) {
        if(typeof element === 'object') {
          copy[index] = clone(element);
        } else {
          copy[index] = element;
        }
      });
    } else {
      copy = {};
      Object.keys(obj).forEach(function(key) {
        copy[key] = typeof obj[key] === 'object' ? clone(obj[key]) : obj[key];
      });
    }
    return copy;
  } else {
    return obj;
  }
}

function merge(a, b) {
  a = clone(a);

  var isArray = Array.isArray(b);
  var out = isArray ? [] : {};

  if(isArray) {
    out = out.concat(a);
    b.forEach(function(value) {
      if(typeof value === 'object') {
        out.push(merge(Array.isArray(value) ? [] : {}, value));
      } else {
        out.push(value);
      }
    });
  } else {
    out = a;
    Object.keys(b).forEach(function(key) {
      out[key] = typeof b[key] === 'object' ? merge({}, b[key]) : b[key];
    });
  }

  return out;
}

function memoize(fn) {
  var ctx = fn;
  ctx._values = ctx.values || {};
  return function() {
    var args = slice.call(arguments);
    if(!ctx._values[args]) {
      ctx._values[args] = fn.apply(ctx, args);
    }

    return ctx._values[args];
  };
}

function setupCluster(config, done) {
  var defaults = {
    enable: true,
    instances: os.cpus().length - 1 || 1
  };

  if(arguments.length) {
    if(typeof config === 'function') {
      done = config;
      config = defaults;
    }
  } else {
    config = defaults;
  }

  function fork() {
    var worker = cluster.fork();

    return worker;
  }

  var instances = config.instances ? config.instances : 1;

  if(config.enable && cluster.isMaster) {
    for(var i = 0; i < instances; i++) {
      fork();
    }

    cluster.on('exit', function(worker) {
      if(!worker.suicide) {
        fork();
      }
    });
  } else {
    process.nextTick(done);
  }
}

function unique(prefix) {
  return new Promise(function(resolve, reject) {
    return crypto.randomBytes(16, function(err, token) {
      if(err) {
        reject(err);
      } else {
        token = prefix ? prefix + ':' + token.toString('hex') : token.toString('hex');
        resolve(token);
      }
    });
  });
}

function hash(value, salt) {
  salt = salt || 10;

  return new Promise(function(resolve, reject) {
    return bcrypt.hash(value, salt, function(err, hashed) {
      if(err) {
        reject(err);
      } else {
        resolve(hashed);
      }
    });
  });
}

function compareHash(raw, hash) {
  return new Promise(function(resolve, reject) {
    return bcrypt.compare(raw, hash, function(err, result) {
      if(err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function defer(time) {
  time = time || 0;

  return new Promise(function(resolve) {
    return setTimeout(resolve, time);
  });
}

function safeParse(json) {
  return new Promise(function(resolve, reject) {
    var p = null;
    try {
      p = JSON.parse(json);
    } catch(e) {
      return reject(e);
    }

    return resolve(p);
  });
}

module.exports = {
  clone: clone,
  merge: merge,
  memoize: memoize,
  cluster: setupCluster,
  unique: unique,
  hash: hash,
  compareHash: compareHash,
  defer: defer,
  parse: safeParse
};
