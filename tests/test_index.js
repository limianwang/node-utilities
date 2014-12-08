
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var assert = chai.assert;

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

  describe('memoize', function() {
    var memoize;
    before(function() {
      memoize = util.memoize;
    });

    it('should be able to memoize a function', function() {
      var stub = sinon.stub();

      function echo(i) {
        stub();
        return i;
      };

      var echoCache = memoize(echo);

      var a1 = echoCache(1);
      var a2 = echoCache(1);

      assert.ok(a1 === a2);
      assert.ok(stub.calledOnce);
    });

    it('should be able to memoize a function but get called when having different arguments', function() {
      var stub = sinon.stub();

      function echo(i) {
        stub();
        return i;
      }

      var echoCache = memoize(echo);

      var a1 = echoCache(1);
      var a2 = echoCache(2);

      assert.notOk(a1 === a2);
      assert.notOk(stub.calledOnce);
      assert.ok(stub.calledTwice);
    });

    it('should be able to memoize and keep context for different functions', function() {
      var stub1 = sinon.stub();
      var stub2 = sinon.stub();

      function echo1(i) {
        stub1();
        return i;
      }

      function echo2(i) {
        stub2();
        return i + 1;
      }

      var cache1 = memoize(echo1);
      var cache2 = memoize(echo2);

      var a1 = cache1(1);
      var a2 = cache1(1);
      var b1 = cache2(3);
      var b2 = cache2(3);

      assert.ok(a1 === 1);
      assert.ok(a2 === 1);
      assert.ok(stub1.calledOnce);
      assert.ok(b1 === 4);
      assert.ok(b2 === 4);
      assert.ok(stub2.calledOnce);
    });
  });
});
