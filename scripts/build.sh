#!/usr/bin/env bash

MYPATH=$(dirname $(readlink -f $0))
APPROOT=$(dirname ${MYPATH})
HEADER="// Build by "$(whoami)" on "$(date)

rm -rf ${APPROOT}/dist
mkdir ${APPROOT}/dist

echo "Copying"
for i in $(echo lib/*.js) ; do
  NAME=$(basename ${i})
  echo "  dist/"${NAME}
  cp lib/${NAME} dist/${NAME}
done

echo
echo "Compiling"
echo "  dist/browser.js"
{ echo ${HEADER} ; php ${APPROOT}/lib/browser.js.php ; } > ${APPROOT}/dist/browser.js

echo
echo "Finish"
