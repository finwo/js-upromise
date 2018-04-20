var defaultData = require('./defaultData'),
    noop        = require('./noop'),
    handlers    = require('./handlers');

module.exports = function(UPromise) {
  return function ( resolve, reject ) {
    // Build new promise without starting it & push it to our queue
    var output = Object.assign(Object.create(UPromise.prototype), defaultData, {__state:'waiting'}),
        self   = this;
    self.__stack.push({
      resolve : resolve || noop,
      reject  : reject || noop
    });
    self.__stack.push({
      prom  : output
    });

    // If we're done already, start the queue ASAP
    if ( self.__state === 'resolved' ) {
      setTimeout(handlers.resolve.bind(self, self.__data),0);
    } else if ( self.__state === 'rejected' ) {
      setTimeout(handlers.reject.bind(self, self.__error),0);
    }

    return output;
  };
};
