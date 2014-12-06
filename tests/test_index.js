
'use strict';

var chai = require('chai');
var expect = chai.expect;

chai.config.includeStack = true;

describe('Test utilities', function() {
  var util = require('../');

  describe('Clone', function() {
    var clone;
    before(function() {
      clone = util.clone;
    });

    it('should be able to clone an object', function() {
      var obj = {
        a: {
          b: {
            key: 'field'
          }
        },
        b: [1,2, { key: 'field2' } ],
        c: 3
      };

      var result = clone(obj);
      expect(result).to.deep.equal(obj);
      expect(result).to.not.equal(obj);
    });

    it('should be able to clone an object with `null`', function() {
      var obj = {
        a: null,
        b: 'tester',
        c: []
      };

      var result = clone(obj);
      expect(result).to.deep.equal(obj);
      expect(result).to.not.equal(obj);
    });

    it('should be able to clone just a value', function() {
      var obj = 'test';
      var result = clone(obj);
      expect(result).to.equal(obj);
    });
  });

  describe('Merge', function() {
    var merge;
    before(function() {
      merge = util.merge;
    });

    it('should be able to merge two objects', function() {
      var a = {
        a: 'b'
      };

      var b = {
        b: 'c'
      };

      var o = {
        a: 'b',
        b: 'c'
      };

      var r = merge(a, b);
      expect(r).to.deep.equal(o);

    });

    it('should be able to handle arrays', function() {
      var a = {
        a: [1, 2, 3]
      };

      var b = {
        b: 'string'
      };

      var o = {
        a: [1, 2, 3],
        b: 'string'
      };

      var r = merge(a, b);
      expect(r).to.deep.equal(o);

      var p = merge(b, a);
      expect(r).to.deep.equal(o);
    });
  });
});
