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
