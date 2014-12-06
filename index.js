
'use strict';

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

module.exports = {
  clone: clone,
  merge: merge
};

