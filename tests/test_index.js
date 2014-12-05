
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
          b: 'c'
        },
        b: [1,2,3],
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
});
