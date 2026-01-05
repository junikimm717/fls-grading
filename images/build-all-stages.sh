#!/usr/bin/env bash

set -euo pipefail

export DIST
export SRC

cd /workspace
ROOTFS="$DIST/busybox" timeout -f 3m ./busybox/build.sh
ROOTFS="$DIST/kernel" timeout -f 15m ./kernel/build.sh
ROOTFS="$DIST/user" timeout -f 3m ./user/build.sh
ROOTFS="$DIST/image" timeout -f 3m ./image/build.sh

test -f "$DIST/bootable.img" || {
  echo "You never created an image at $DIST/bootable.img";
  exit 1
}
