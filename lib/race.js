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
