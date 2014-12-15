
'use strict';

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

module.exports = {
  clone: clone,
  merge: merge,
  memoize: memoize
};

