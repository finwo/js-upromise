var noop = require('./noop');

module.exports = function (reject) {
  return this.then(noop, reject);
};
