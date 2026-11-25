#!/bin/bash
cd "$(dirname "$0")"
{
cat head.html
echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
echo '<script>'
cat data1.js data2.js data3.js models1.js models2.js models3.js app.js
echo '</script>'
} > index.html
wc -c index.html
