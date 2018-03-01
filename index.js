function UPromise(cb) {
  var self       = this;
  this.__next    = null;
  this.__started = false;
  this.__catch   = undefined;
  this.start     = function (data) {
    this.__started = true;
    var result;
    if ( 'function' !== typeof cb ) {
      return console.error('Given callback was not a function:', cb);
    }
    if (data === undefined) {
      result = cb(this.__next && this.__next.start || function () {}, this.__catch || console.error);
    } else {
      try {
        result = cb(data);
      } catch(e) {
        return (this.__catch || console.error)(e);
      }
    }
    if ( result && ( 'function' === typeof result.then ) ) {
      result.then(this.__next && this.__next.start || function(){}, this.__catch || console.error );
      if(!result.__started) result.start();
    } else if (result !== undefined) {
      this.__next && this.__next.start && this.__next.start(result);
    }
  };
  this.then      = function (onResolve,onReject) {
    this.__next           = new UPromise(onResolve);
    this.__next.__catch   = onReject;
    this.__next.__started = true;
    this.then             = this.then.bind(this.__next);
    this.catch            = this.catch.bind(this.__next);
    return this;
  };
  this.catch = function (onReject) {
    this.__catch = onReject;
    return this;
  };
  setTimeout(function () {
    if (!self.__started) self.start();
  }, 0);
}

UPromise.all = function(arr) {
  var q = new UPromise(function(resolve,reject) {
    resolve();
  });
  arr.forEach(function(entry) {
    q.then(entry);
  });
  return q;
};

module.exports = UPromise;
