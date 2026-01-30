#!/bin/sh

grep 'javascript:openStudentPicture' \
  | sed \
    -e 's/^.*\((.*)\).*$/\1/g' \
    -e 's/&quot;//g' \
  | tr -d '()' \
  | awk -F ',' '{print tolower($4)}'
