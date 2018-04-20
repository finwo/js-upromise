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
  <?php
    function req( $path, $cwd = null ) {
      if (is_null($cwd)) $cwd = __DIR__;
      $cwd .= DIRECTORY_SEPARATOR;
      $filename = str_replace(['/', '\\'],DIRECTORY_SEPARATOR, $cwd.$path.'.js');
      $newcwd   = dirname($filename);
      $contents = preg_replace_callback('/require\\(\\\'(\\.\\.?\\/[\\/\\w]+)\\\'\\)/',function($match) use ($newcwd) {
        return req($match[1],$newcwd);
      }, file_get_contents($filename));
      return
          "(function() {\r\n".
          "  var module = { exports: undefined };\r\n".
          $contents.
          "  return module.exports;\r\n".
          "})()\r\n";
    }
   ?>

  return <?= req('./core'); ?>;
});
