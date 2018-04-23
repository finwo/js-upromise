var chai = require('chai');
var expect = chai.expect;

// Load our promise lib
var UPromise = require('../dist/core');

it('Test for double-stack execution', function() {
  var cnt = 0;

  // Double-resolve to try & trigger a double stack
  new UPromise(function(resolve) {
    resolve();
    resolve();
  }).then(function() {
    cnt += 1;
  }, function() {
    throw new Error("Was not supposed to fail");
  }).then(function() {
    cnt += 1;
  }, function() {
    throw new Error("Was not supposed to fail");
  });

  // Give the promise that's being tested some time to resolve
  return new UPromise(function(resolve) {
    setTimeout(function() {
      expect(cnt).to.equal(2);
      resolve();
    },100);
  }).catch(function() {
    throw new Error("Was not supposed to fail");
  });
});
