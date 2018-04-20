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

// Default data, so we don't have to write this a lot of times
  var defaultData = {
    __state     : 'pending',
    __data      : undefined,
    __error     : undefined
  };

  return UPromise;
});
