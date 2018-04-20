// Build by finwo on Fri Apr 20 15:14:08 CEST 2018
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
  
  return (function() {
  var module = { exports: undefined };
var gettype = (function() {
  var module = { exports: undefined };
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
  return module.exports;
})()
,
    noop    = (function() {
  var module = { exports: undefined };
module.exports = function ( data ) {
  return data;
};
  return module.exports;
})()
;

// Default data, so we don't have to write this a lot of times
var defaultData = {
  __state     : 'pending',
  __stack     : [],
  __data      : undefined,
  __error     : undefined
};

function onResolve( data ) {
  var self = this;
  self.__state = ( self.__state === 'waiting' ? 'pending' : self.__state );

  // Return a promise = resolve that first
  if ( ( 'object' === typeof data ) && ('function' === typeof data.then)) {
    data.then( onResolve.bind(self), onReject.bind(self) );
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
  if ( ( 'object' === typeof next.prom ) && ('function' === typeof next.prom.then)) {
    next.prom.then( onResolve.bind(self), onReject.bind(self) );

    // If it's a paused UPromise, start it
    if ( ('upromise' === gettype(next.prom)) && (next.prom.__state === 'waiting') ) {
      onResolve.call(next.prom, data);
    }

    return;
  }

  // Run whatever's next
  try {
    var result = next.resolve(data);
    if ( self.__stack.length ) {
      onResolve.call(self,result);
    } else {
      self.__state = 'resolved';
      self.__data  = result;
      return;
    }
  } catch(e) {
    if ( self.__stack.length ) {
      onReject.call(self,e);
    } else {
      self.__state = 'rejected';
      self.__error = e;
      return;
    }
  }

  // We're done
  self.__state = 'resolved';
  self.__data  = data;
}

function onReject( reason ) {
  var self = this,
      next = {};
  self.__state = ( self.__state === 'waiting' ? 'pending' : self.__state );

  // Find the first catch
  while( next && !next.reject ) {
    next = self.__stack.shift();
  }

  // Nothing left = uncaught error
  if (!next) {
    throw new Error("Uncaught Promise rejection:" + reason);
  }

  // Run whatever's next
  try {
    var result = next.reject(reason);
    if ( self.__stack.length ) {
      onResolve.call(self,result);
    } else {
      self.__state = 'rejected';
      self.__data  = result;
      self.__error = reason;
      return;
    }
  } catch(e) {
    if ( self.__stack.length ) {
      onReject.call(self,e);
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

function UPromise (executor) {
  // Keep a reference & inject default data
  var self = this;
  Object.assign(this, defaultData);

  // Sanity check
  if ('function' !== typeof executor) {
    throw new TypeError("Promise resolver " + executor + " is not a function");
  }

  // Run the executor NOW
  try {
    executor(onResolve.bind(self), onReject.bind(self));
  } catch(e) {
    onReject.call(self, e);
  }
}


UPromise.resolve = function (data) {
  return ( data && ( 'function' === typeof data.then ) ) ? data : Object.assign(Object.create(UPromise.prototype), defaultData, {__state : 'resolved', __data : data});
};

UPromise.reject = function (reason) {
  return Object.assign(Object.create(UPromise.prototype), defaultData, {__state : 'rejected', __error : reason});
};

UPromise.all = function (arr, data) {
  var q = UPromise.resolve(data);
  arr.forEach(function(entry) {
    q = q.then(entry);
  });
  return q;
};

UPromise.prototype.catch = function (reject) {
  return this.then(noop, reject);
};

UPromise.prototype.then = function ( resolve, reject ) {
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
    setTimeout(onResolve.bind(self, self.__data),0);
  } else if ( self.__state === 'rejected' ) {
    setTimeout(onReject.bind(self, self.__error),0);
  }

  return output;
};

UPromise.prototype.name = 'UPromise';
module.exports = UPromise;
  return module.exports;
})()
;
});
