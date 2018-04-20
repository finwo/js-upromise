// Default data, so we don't have to write this a lot of times
var defaultData = require('./defaultData'),
    handlers    = require('./handlers');

function UPromise(executor) {
  // Keep a reference & inject default data
  var self = this;
  Object.assign(this, defaultData);

  // Sanity check
  if ('function' !== typeof executor) {
    throw new TypeError("Promise resolver " + executor + " is not a function");
  }

  // Run the executor NOW
  try {
    executor(handlers.resolve.bind(self), handlers.reject.bind(self));
  } catch (e) {
    handlers.reject.call(self, e);
  }
}

UPromise.resolve         = require('./resolve')(UPromise);
UPromise.reject          = require('./reject')(UPromise);
UPromise.prototype.catch = require('./catch');
UPromise.prototype.then  = require('./then')(UPromise);
UPromise.all             = require('./all')(UPromise);
UPromise.race            = require('./race')(UPromise);
UPromise.prototype.name  = 'UPromise';
module.exports           = UPromise;
