
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

module.exports = {
  clone: clone
};

