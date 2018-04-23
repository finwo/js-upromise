var chai = require('chai');
var expect = chai.expect;

// Load our promise lib
var UPromise = require('../dist/core');

it('resolves as promised', function() {
  return UPromise.resolve("woof")
                .then(function(m) { expect(m).to.equal('woof'); })
                .catch(function() { throw new Error('was not supposed to fail'); })
    ;
});

it('rejects as promised', function() {
  return UPromise.reject("caw")
                .then(function() { throw new Error('was not supposed to succeed'); })
                .catch(function(m) { expect(m).to.equal('caw'); })
    ;
});
