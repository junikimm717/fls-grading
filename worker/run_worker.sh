#!/bin/sh

## This script should NEVER be run outside a dedicated environment.

set -eu
DIR="$(realpath "$(dirname "$0" )" )"
cd "$DIR"

FLS_HOST_ROOT="$DIR/"
FLS_MOUNT_PREFIX="/files"

if ! test -f "$DIR/env.prod"; then
  cat <<EOF > "$DIR/env.prod"
FLS_GRADING_SECRET="API Key you got from the portal"
FLS_GRADING_BASEURL="https://6s913.mit.junic.kim"
FLS_GRADING_GRADER="ghcr.io/junikimm717/fls-grading/grader"
FLS_GRADING_BUILDER="ghcr.io/junikimm717/fls-grading/dev"
EOF
  echo "Populated $DIR/env.prod with variables. Please restart the container."
  exit 1
fi

docker run \
  --env-file "$DIR/env.prod" \
  --restart unless-stopped \
  -e FLS_HOST_ROOT="$FLS_HOST_ROOT" \
  -e FLS_MOUNT_PREFIX="$FLS_MOUNT_PREFIX" \
  -v "$FLS_HOST_ROOT":"$FLS_MOUNT_PREFIX" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -it ghcr.io/junikimm717/fls-grading/worker
