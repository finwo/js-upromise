#!/usr/bin/env bash

MYPATH=$(dirname $(readlink -f $0))
APPROOT=$(dirname ${MYPATH})
HEADER="// Build on "$(date)" by "$(whoami)

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
echo "Minifying"
echo "  dist/browser.js > dist/browser.min.js"
${APPROOT}/node_modules/.bin/uglifyjs --compress --mangle -- dist/browser.js > dist/browser.min.js

# If we wanted to uglify all, run something like this:
# for f in $(echo dist/*.js) ; do
#   IN=${f}
#   OUT="${f%.js}.min.js"
#   ${APPROOT}/node_modules/.bin/uglifyjs --compress --mangle -- ${IN} > ${OUT}
# done

echo
echo "Finish"
