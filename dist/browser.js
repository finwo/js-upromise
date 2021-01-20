// Build on Wed Jan 20 12:09:35 CET 2021 by finwo

(function(factory) {
  /** global: define */
  if ( ( 'undefined' !== module ) && ( 'undefined' !== module.exports ) ) {
    module.exports = factory();
  } else if ( ( 'function' === typeof define ) && define.amd ) {
    define([],factory);
  } else if ( 'undefined' !== typeof window ) {
    window.EE = factory();
  } else if ( 'undefined' !== typeof global ) {
    global.EE = factory();
  } else {
    throw new Error("Could not initialize UPromise");
  }
})(function() {
    
  // Our modules
  var _r = (function() {
    var m = {
      '3':(function() {var module = { exports: undefined };
module.exports = function(UPromise) {
  return function( cbfunc ) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      return new UPromise(function(resolve, reject) {
        args.push(function( err, data ) {
          if ( err ) return reject(err);
          resolve(data);
        });
        cbfunc.apply( undefined, args );
      });
    };
  };
};

return module.exports;})(),
'f':(function() {var module = { exports: undefined };
module.exports = function(UPromise) {
  return function( iterable ) {
    return new UPromise(function(resolve, reject) {
      var finished = false;
      iterable.forEach(function(entry) {
        UPromise
          .resolve()
          .then(entry)
          .then(function( data ) {
            if ( finished ) { return; }
            finished = true;
            resolve(data);
          }, function(reason) {
            if (finished) { return; }
            finished = true;
            reject(reason);
          });
      });
    });
  };
};

return module.exports;})(),
'52':(function() {var module = { exports: undefined };
module.exports = function(UPromise) {
  return function ( iterable ) {
    var q = UPromise.resolve();
    iterable.forEach(function(entry) {
      q = q.then(entry);
    });
    return q;
  };
};



return module.exports;})(),
'6':(function() {var module = { exports: undefined };
var defaultData = _r('2'),
    noop        = _r('s'),
    handlers    = _r('j');

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

return module.exports;})(),
'j':(function() {var module = { exports: undefined };
var gettype = _r('p');

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

return module.exports;})(),
'p':(function() {var module = { exports: undefined };
module.exports = function gettype(data) {
  switch (typeof data) {

    // Easy types
    case 'string'   : return 'string';
    case 'boolean'  : return 'boolean';
    case 'undefined': return 'undefined';
    case 'number'   : return 'number';

    // Complex types
    case 'object':
      if (null === data) {
        return null;
      }
      if (data && data.constructor && (data.constructor.name === "UPromise") ) {
        return 'upromise';
      }
      if (data && ('function' === typeof data.next)) {
        return 'generator';
      }
      if (data && ('function' === typeof data.then)) {
        return 'promise';
      }
      if (Array.isArray(data)) {
        return 'array';
      }
      return 'object';

    case 'function':
      if (Object.getPrototypeOf(data).constructor.name === "GeneratorFunction") {
        return 'generator-function';
      }
      return 'function';

    default:
      return 'unknown';
  }
};

return module.exports;})(),
's':(function() {var module = { exports: undefined };
module.exports = function ( data ) {
  return data;
};

return module.exports;})(),
'2':(function() {var module = { exports: undefined };
module.exports = {
  __state     : 'pending',
  __stack     : [],
  __data      : undefined,
  __error     : undefined
};

return module.exports;})(),
'5':(function() {var module = { exports: undefined };
var noop = _r('s');

module.exports = function (reject) {
  return this.then(noop, reject);
};

return module.exports;})(),
'pt':(function() {var module = { exports: undefined };
var defaultData = _r('2');

module.exports = function(UPromise) {
  return function (reason) {
    return Object.assign(Object.create(UPromise.prototype), defaultData, {__state : 'rejected', __error : reason});
  };
};

return module.exports;})(),
'm':(function() {var module = { exports: undefined };
var defaultData = _r('2');

module.exports = function(UPromise) {
  return function(data) {
    return ( data && ( 'function' === typeof data.then ) ) ? data : Object.assign(Object.create(UPromise.prototype), defaultData, {__state : 'resolved', __data : data});
  };
};

return module.exports;})(),
    };
    return function(n) {
      return ( n in m ) ? m[n] : undefined;
    };
  })();

  return (function() {
    var module = { exports: undefined };
    // Default data, so we don't have to write this a lot of times
var defaultData = _r('2'),
    handlers    = _r('j');

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

UPromise.resolve         = _r('m')(UPromise);
UPromise.reject          = _r('pt')(UPromise);
UPromise.prototype.catch = _r('5');
UPromise.prototype.then  = _r('6')(UPromise);
UPromise.all             = _r('52')(UPromise);
UPromise.race            = _r('f')(UPromise);
UPromise.from            = _r('3')(UPromise);
UPromise.prototype.name  = 'UPromise';
module.exports           = UPromise;
    return module.exports;
  })();
});
