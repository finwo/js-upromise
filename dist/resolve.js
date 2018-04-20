var defaultData = require('./defaultData');

module.exports = function(UPromise) {
  return function(data) {
    return ( data && ( 'function' === typeof data.then ) ) ? data : Object.assign(Object.create(UPromise.prototype), defaultData, {__state : 'resolved', __data : data});
  };
};
