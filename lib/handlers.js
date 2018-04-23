var gettype = require('./gettype');

module.exports = {
  resolve : function (data) {
    var self     = this;
    self.__state = (self.__state === 'waiting' ? 'pending' : self.__state);

    // Return a promise = resolve that first
    if (('object' === typeof data) && ('function' === typeof data.then)) {
      data.then(onResolve.bind(self), onReject.bind(self));
      return;
    }

    // Fetch the next thing to run
    var next = self.__stack.shift();

    // Nothing left = done
    if (!next) {
      self.__state = 'resolved';
      self.__data  = data;
      return;
    }

    // Promise in between = finish that before continuing
    if (('object' === typeof next.prom) && ('function' === typeof next.prom.then)) {
      next.prom.then(onResolve.bind(self), onReject.bind(self));

      // If it's a paused UPromise, start it
      if (('upromise' === gettype(next.prom)) && (next.prom.__state === 'waiting')) {
        onResolve.call(next.prom, data);
      }

      return;
    }

    // If the resolve is a value already, run the next entry using it as data
    if ('function' !== typeof next.resolve) {
      onResolve.call(self, next.resolve);
      return;
    }

    // Run whatever's next
    try {
      var result = next.resolve(data);
      if (self.__stack.length) {
        onResolve.call(self, result);
      } else {
        self.__state = 'resolved';
        self.__data  = result;
        return;
      }
    } catch (e) {
      if (self.__stack.length) {
        onReject.call(self, e);
      } else {
        self.__state = 'rejected';
        self.__error = e;
        return;
      }
    }

    // We're done
    self.__state = 'resolved';
    self.__data  = data;
  },
  reject  : function (reason) {
    var self     = this,
        next     = {};
    self.__state = (self.__state === 'waiting' ? 'pending' : self.__state);

    // Find the first catch
    while (next && !next.reject) {
      next = self.__stack.shift();
    }

    // Nothing left = uncaught error
    if (!next) {
      throw new Error("Uncaught Promise rejection:" + reason);
    }

    // Run whatever's next
    try {
      var result = next.reject(reason);
      if (self.__stack.length) {
        onResolve.call(self, result);
      } else {
        self.__state = 'rejected';
        self.__data  = result;
        self.__error = reason;
        return;
      }
    } catch (e) {
      if (self.__stack.length) {
        onReject.call(self, e);
      } else {
        self.__state = 'rejected';
        self.__error = e;
        return;
      }
    }

    // We're done
    self.__state = 'rejected';
    self.__error = reason;
  }
};

// Local references
var onResolve = module.exports.resolve,
    onReject  = module.exports.reject;
