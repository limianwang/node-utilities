
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

function setupCluster(done) {
  function fork() {
    var worker = cluster.fork();

    return worker;
  }

  if(cluster.isMaster) {
    var max = os.cpus().length - 1 || 1;

    for(var i = 0; i < max; i++) {
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

  crypto.randomBytes(16, function(err, id) {
    id = prefix ? prefix + ':' + id.toString('hex') : id.toString('hex');
    done(err, id);
  });
}

module.exports = {
  clone: clone,
  merge: merge,
  memoize: memoize,
  cluster: setupCluster,
  unique: unique
};
