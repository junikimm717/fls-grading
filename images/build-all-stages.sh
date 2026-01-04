#!/usr/bin/env bash

set -euo pipefail

export DIST
export SRC

cd /workspace
ROOTFS="$DIST/busybox" ./busybox/build.sh
ROOTFS="$DIST/kernel" ./kernel/build.sh
ROOTFS="$DIST/user" ./user/build.sh
ROOTFS="$DIST/image" ./image/build.sh

test -f "$DIST/bootable.img" || {
  echo "You never created an image at $DIST/bootable.img";
  exit 1
}
