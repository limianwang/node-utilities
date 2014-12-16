
'use strict';

var cluster = require('cluster');
var os = require('os');

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

  describe('Cluster', function() {
    var setup;
    before(function() {
      setup = util.cluster;
    });

    afterEach(function() {
      cluster.removeAllListeners('exit');
    });

    it('should maintain a minimum of 1 forked', function(done) {
      var mockCpus = ['cpu1'];

      var cpu = sinon.stub(os, 'cpus').returns(mockCpus);
      var fork = sinon.stub(cluster, 'fork');

      setup();

      process.nextTick(function() {
        assert.ok(cpu.calledOnce);
        assert.ok(fork.calledOnce);

        os.cpus.restore();
        cluster.fork.restore();
        done();
      });
    });

    it('should maintain up to max - 1', function(done) {
      var mockCpus = ['cpu1', 'cpu2', 'cpu3'];

      var cpu = sinon.stub(os, 'cpus').returns(mockCpus);
      var fork = sinon.stub(cluster, 'fork');

      setup();

      process.nextTick(function() {
        assert.ok(cpu.calledOnce);

        expect(fork.callCount).to.be.equal(mockCpus.length - 1);

        os.cpus.restore();
        cluster.fork.restore();

        done();
      });
    });

    it('should be able to re-fork when a worker dies unexpectedly', function(done) {
      var fork = sinon.stub(cluster, 'fork');

      var mock = {
        suicide: false
      };

      setup();

      process.nextTick(function() {
        expect(fork.callCount).to.be.equal(os.cpus().length - 1);

        cluster.emit('exit', mock);

        expect(fork.callCount).to.be.equal(os.cpus().length);
        cluster.fork.restore();
        done();
      });
    });

    it('should prevent forking when worker dies by suiciding', function(done) {
      var fork = sinon.stub(cluster, 'fork');

      var mock = {
        suicide: true
      };

      setup();

      process.nextTick(function() {
        expect(fork.callCount).to.be.equal(os.cpus().length - 1);
        cluster.emit('exit', mock);
        expect(fork.callCount).to.be.equal(os.cpus().length - 1);

        cluster.fork.restore();
        done();
      });
    });

    it('should simply execute callback when process is not master', function(done) {
      cluster.isMaster = false;

      var stub = sinon.stub();

      setup(stub);

      process.nextTick(function() {
        assert.ok(stub.calledOnce);
        done();
      });
    });
  });
});
