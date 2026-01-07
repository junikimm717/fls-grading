#!/bin/sh

# You should ignore this script if you do not have AWS infrastructure running
# the graders :)

set -eu

aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --targets "Key=tag:flsrole,Values=grader" \
  --parameters 'commands=[
    "/opt/fls/update.sh",
  ]'

