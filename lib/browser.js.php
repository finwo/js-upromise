<?php

// Keep a reference to the files
$required = array();
$index    = array();

function genkey() {
  global $index;
  $alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  $out      = substr($alphabet,rand(0,strlen($alphabet)-1),1);
  while(array_key_exists($out,$index)) $out .= substr($alphabet,rand(0,strlen($alphabet)-1),1);
  return $out;
}

function reqpath( $path, $cwd = null ) {
  if (is_null($cwd)) $cwd = __DIR__;
  $cwd .= DIRECTORY_SEPARATOR;
  return realpath(str_replace(['/', '\\'],DIRECTORY_SEPARATOR, $cwd.$path.'.js'));
}

// The main function to merge the files
function req( $path, $cwd = null ) {
  global $required, $index;

  // Build full path
  $filename = reqpath($path,$cwd);
  $newcwd   = dirname($filename);

  // Find or generate an ID for this file
  $id = array_search($filename,$index);
  if ($id === false) $id = genkey();
  $index[$id] = $filename;

  // Let's render it (replacing require by our cache)
  $contents = preg_replace_callback('/require\\(\\\'(\\.\\.?\\/[\\/\\w]+)\\\'\\)/', function($match) use ($newcwd) {
    global $index;
    req($match[1],$newcwd);
    $fullpath = reqpath($match[1],$newcwd);
    $id = array_search($fullpath,$index);
    return "_r('${id}')";
  }, file_get_contents($filename));

  // Store this
  if(!is_null($cwd)) {
    array_push($required, array(
        'id'      => $id,
        'path'    => $filename,
        'content' => $contents,
    ));
  }

  return $contents;
}
?>

<?php /* Wrapper for common environments */ ?>
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
  <?php /* Load our own module */ ?>
  <?php $content = req('./core'); ?>

  // Our modules
  var _r = (function() {
    var m = {
      <?php
        $included = array();
        while(count($required)>0) {
          $module = array_pop($required);
          if ( in_array($module['id'], $included)) continue;
          array_push($included,$module['id']);
          echo "'".$module['id']."':(function() {var module = { exports: undefined };\r\n".
//               "// ".$module['path']."\r\n".
               $module['content'].
               "\r\nreturn module.exports;})(),\r\n";
        }
      ?>
    };
    return function(n) {
      return ( n in m ) ? m[n] : undefined;
    };
  })();

  return (function() {
    var module = { exports: undefined };
    <?= $content ?>
    return module.exports;
  })();
});
