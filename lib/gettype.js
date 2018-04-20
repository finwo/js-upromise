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
