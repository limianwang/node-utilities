
'use strict';

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
  var out = clone(a);

  Object.keys(b).forEach(function(key) {
    out[key] = typeof b[key] === 'object' ? merge({}, b[key]) : b[key];
  });

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

function unique(prefix, done) {
  if(typeof prefix === 'function') {
    done = prefix;
    prefix = '';
  }

  crypto.randomBytes(16, function(err, token) {
    token = prefix ? prefix + ':' + token.toString('hex') : token.toString('hex');
    done(err, token);
  });
}

module.exports = {
  clone: clone,
  merge: merge,
  memoize: memoize,
  cluster: setupCluster,
  unique: unique
};
