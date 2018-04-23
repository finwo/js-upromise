var defaultData = require('./defaultData');

module.exports = function(UPromise) {
  return function (reason) {
    return Object.assign(Object.create(UPromise.prototype), defaultData, {__state : 'rejected', __error : reason});
  };
};
