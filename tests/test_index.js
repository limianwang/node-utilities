'use strict';

var bcrypt = require('bcrypt');
var crypto = require('crypto');
var cluster = require('cluster');
var os = require('os');
var fs = require('fs');

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
        c: new Date()
      };

      var result = clone(obj);
      expect(result).to.deep.equal(obj);
      expect(result).to.not.equal(obj);

      expect(obj.c).to.not.equal(result.c);
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

    it('should be able to merge array with object', function() {
      var obj = {
        arr: [{
          a: 'b'
        },
        {
          b: 'c'
        }]
      }

      var r = merge({ i: 1 }, obj);

      expect(r)
        .to.deep.equal({
          i: 1,
          arr: [{
            a: 'b'
          }, {
            b: 'c'
          }]
        });
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

    it('should merge object within array', function() {
      var a = [[1, 2, 3], { a: 'b' }];
      var b = [1, 2, {a : 'b'}];

      var out = merge(a, b);

      var expected = [[1,2,3], {a: 'b'}, 1,2,{a: 'b'}];
      expect(out).to.deep.equal(expected);

      var c = [1,2,3, [4, 5, 6]];
      var d = [1,2,3, [2,2,2]];

      out = merge(c, d);

      expected = [1,2,3,[4,5,6], 1,2,3,[2,2,2]];
      expect(out).to.deep.equal(expected);
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

  describe('Memoize', function() {
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

    it('should be able to get a token with a prefix', function(done) {
      unique('user')
        .then(function(token) {
          expect(token).to.match(/^user:/);
          done();
        })
        .catch(function(err) {
          expect(err).to.not.exist;
        });
    });

    it('should be able to ommit optional prefix', function(done) {
      unique()
        .then(function(token) {
          expect(token).to.not.include(':');
          expect(token).to.have.length(32);

          done();
        })
        .catch(function(err) {
          expect(err).to.not.exist;
        });
    });

    it('should be able to catch error', function(done) {
      sinon.stub(crypto, 'randomBytes').yields(new Error('fake'));

      var stub = sinon.stub();

      unique()
        .then(stub)
        .catch(function(err) {
          expect(err).to.exist;
          expect(err).to.have.property('constructor').to.have.property('name');

          assert.ok(stub.notCalled);

          crypto.randomBytes.restore();

          done();
        });
    });
  });

  describe('bcrypt', function() {
    var hash, compareHash;

    before(function() {
      hash = util.hash;
      compareHash = util.compareHash;
    });

    it('should be able to hash a password and compare', function(done) {
      var password = 'my_long_long_important_password';

      hash(password)
        .then(function(hashed) {
          expect(hashed).to.exist;
          expect(hashed).to.not.equal(password);

          return compareHash(password, hashed);
        })
        .then(function(result) {
          assert.ok(result);

          done();
        })
        .catch(function(err) {
          expect(err).to.not.exist;
        });;
    });

    it('should be able to provide a salt', function(done) {
      hash('test', 11)
        .then(function(hashed) {
          expect(hashed).to.exist;

          return compareHash('test', hashed);

        })
        .then(function(result) {
          assert.ok(result);

          done();
        })
        .catch(function(err) {
          expect(err).to.not.exist;
        });
    });

    it('should be able to catch hash error', function(done) {
      sinon.stub(bcrypt, 'hash').yields(new Error('fake'));

      var stub = sinon.stub();

      hash('test')
        .then(stub)
        .catch(function(err) {
          expect(err).to.exist;
          assert.ok(stub.notCalled);

          bcrypt.hash.restore();

          done();
        });
    });

    it('should catch compareHash error', function(done) {
      sinon.stub(bcrypt, 'compare').yields(new Error('fake'));

      var stub = sinon.stub();

      hash('test')
        .then(function(hashed) {
          expect(hashed).to.exist;

          return compareHash('test', hashed)
        })
        .then(stub)
        .catch(function(err) {
          expect(err).to.exist;

          assert.ok(stub.notCalled);

          done();
        });
    });
  });

  describe('Defer', function() {
    var defer;

    before(function() {
      defer = util.defer;
    });

    it('should be able to defer to the next iteration', function(done) {
      var func1 = sinon.stub();
      var func2 = sinon.stub();

      var deferred = sinon.stub();

      func1();

      defer().then(deferred);

      func2();

      assert.ok(func1.calledOnce);
      assert.ok(func2.calledOnce);
      assert.ok(deferred.notCalled);

      setTimeout(function() {
        assert.ok(deferred.calledOnce);
        done();
      }, 50);
    });

    it('should be able be called almost immediately', function(done) {
      var start = new Date;

      defer().then(function() {
        var diff = new Date - start;
        expect(diff).to.be.within(0, 10);

        done();
      });
    });

    it('should be able to defer at a give time', function(done) {
      var start = new Date;

      defer(100).then(function() {
        var diff = new Date - start;
        expect(diff).to.be.within(95, 110);

        done();
      });
    });
  });

  describe('Safe Parse JSON', function() {
    var parse;

    before(function() {
      parse = util.parse;
    });

    it('should be able to catch error', function(done) {
      parse('some-non-json-string').catch(function(err) {
        expect(err).to.exist;

        done();
      });
    });

    it('should be able to parse object', function(done) {
      var json = JSON.stringify({ a: 'b'});

      parse(json).then(function(p) {
        expect(p).to.deep.equal({ a: 'b' });

        done();
      });
    });
  });

  describe('Read File', function() {
    var read, path;

    before(function() {
      path = './tests/test-read.txt';
      read = util.read;
      fs.writeFileSync(path, 'js is awesome', 'utf8');
    });

    after(function() {
      fs.unlinkSync(path);
    });

    it('should be able to catch error', function(done) {
      read('path-not-exist').catch(function(err) {
        expect(err).to.exist;

        done();
      });
    });

    it('should be able to read file', function(done) {
      read(path).then(function(data) {
        expect(data).to.be.a('string').to.be.equal('js is awesome');

        done();
      });
    });
  });

  describe('Write File', function() {
    var write, path;

    before(function() {
      path = './tests/test-write.txt';
      write = util.write;
    });

    after(function() {
      fs.unlinkSync(path);
    });

    it('should be able to write some text', function(done) {
      write(path, 'hello world')
        .then(function() {
          return util.read(path);
        })
        .then(function(data) {
          expect(data).to.be.equal('hello world');
          done();
        })
        .catch(function(err) {
          expect(err).to.not.be.ok;
        });
    });

    it('should be able to catch err', function(done) {
      sinon.stub(fs, 'writeFile').yields(new Error('fake'));

      write(path, 'shoot')
        .catch(function(err) {
          expect(err).to.exist;

          fs.writeFile.restore();
          done();
        });
    });
  });

  describe('Padder', function() {
    var padder = util.padder;

    it('should be able to pad a string by default', function() {
      var t = padder('h');

      assert.ok(t === '0h');
    });

    it('should be able to pad with a strict length', function() {
      var opts = {
        length: 3
      };
      var t = padder('x', opts);

      assert.ok(t === '00x');
    });

    it('should be able to pad with strict length and a prefix', function() {
      var opts = {
        prefix: 'x',
        length: 3
      };
      var t = padder('x', opts);

      assert.ok(t === 'xxx');
    });
  });
});
