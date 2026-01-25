#!/bin/sh

grep 'javascript:openStudentPicture' \
  | sed \
    -e 's/^.*\((.*)\).*$/\1/g' \
    -e 's/&quot;//g' \
  | tr -d '()' \
  | awk -F ',' '{print $2 "," $3 "\t" tolower($4)}' \
  | sort \
  | column -t -s $'\t'
