#!/usr/bin/env bash
set -euo pipefail

export DIST
export SRC

cd /workspace

run_stage() {
  local label="$1"
  local limit="$2"
  local script="$3"
  local rootfs="$DIST/$label"
  mkdir -p "$rootfs"

  timeout --preserve-status "$limit" env ROOTFS="$rootfs" "$script"
  status=$?

  if [ "$status" -eq 124 ]; then
    echo "[fls] ERROR: $label stage timed out after $limit" >&2
    exit 124
  elif [ "$status" -ne 0 ]; then
    echo "[fls] ERROR: $label stage failed (exit $status)" >&2
    exit "$status"
  fi
}

run_stage busybox 5m  ./busybox/build.sh
run_stage kernel  20m ./kernel/build.sh
run_stage user    5m  ./user/build.sh
run_stage image   5m  ./image/build.sh

test -f "$DIST/bootable.img" || {
  echo "You never created an image at $DIST/bootable.img"
  exit 1
}
