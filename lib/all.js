module.exports = function(UPromise) {
  return function ( iterable ) {
    var q = UPromise.resolve();
    iterable.forEach(function(entry) {
      q = q.then(entry);
    });
    return q;
  };
};


