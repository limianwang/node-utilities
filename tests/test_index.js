
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

    it('should be able to clone an array', function() {
      var arr = [1, 2, 3];

      var cloned = clone(arr);

      expect(cloned).to.not.equal(arr);
      expect(cloned).to.deep.equal(arr);
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

    it('should merge objects embedded with array', function() {
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

    it('should handle merge object and array', function() {
      var a = {
        a: 'b'
      };

      var b = [1, 2, 3];

      var out = merge(a, b);

      expect(out).to.deep.equal([{a : 'b'}, 1, 2, 3]);
    });

    it('should be able to merge arrays', function() {
      var a1 = [1, 2, 3];
      var a2 = [1, 3, 4];

      var o = merge(a1, a2);

      expect(o).to.deep.equal([1, 2, 3, 1, 3, 4]);
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

    it('should memoize based on arguments', function() {
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

    it('should memoize and keep context for different functions', function() {
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

    it('should execute callback when process is not master', function(done) {
      var orig = cluster.isMaster;

      cluster.isMaster = false;

      var stub = sinon.stub();

      setup(stub);

      process.nextTick(function() {
        assert.ok(stub.calledOnce);

        cluster.isMaster = orig;
        done();
      });
    });

    it('should be able to take config', function(done) {
      var defaults = {
        enable: true
      };

      var fork = sinon.stub(cluster, 'fork');

      setup(defaults);

      process.nextTick(function() {
        expect(fork.callCount).to.be.equal(1);

        cluster.fork.restore();
        done();
      });
    });

    it('should be able to take config and callback', function(done) {
      var defaults = {
        enable: true,
        instances: 4
      };

      var fork = sinon.stub(cluster, 'fork');

      var stub = sinon.stub();

      setup(defaults, stub);

      process.nextTick(function() {
        expect(fork.callCount).to.be.equal(4);
        assert.ok(stub.notCalled);

        cluster.fork.restore();

        done();
      });
    });

    it('should be able to call callback on worker', function(done) {
      var defaults = {};

      var orig = cluster.isMaster;

      cluster.isMaster = false;

      var fork = sinon.stub(cluster, 'fork');
      var stub = sinon.stub();

      setup(defaults, stub);

      process.nextTick(function() {
        assert.ok(fork.notCalled);

        assert.ok(stub.calledOnce);

        cluster.fork.restore();

        cluster.isMaster = orig;

        done();
      });
    });

    it('should be able to disable cluster', function(done) {
      var defaults = {
        instances: 2
      };

      expect(defaults).to.not.have.property('enable');

      var fork = sinon.stub(cluster, 'fork');
      var stub = sinon.stub();

      setup(defaults, stub);

      process.nextTick(function() {
        assert.ok(fork.notCalled);
        assert.ok(stub.calledOnce);

        cluster.fork.restore();
        done();
      });
    });
  });

  describe('crypto', function() {
    var unique;

    before(function() {
      unique = util.unique;
    });

    it('should be able to get a token without prefix', function(done) {
      var prefix = 'hello';
      unique(prefix, function(err, token) {
        expect(err).to.not.be.ok;
        expect(token).to.be.a('string').to.match(/hello:/);

        done();
      });
    });

    it('should be able to ommit optional prefix', function(done) {
      unique(function(err, token) {
        expect(err).to.not.be.ok;
        expect(token).to.be.a('string');
        done();
      });
    });
  });
});
