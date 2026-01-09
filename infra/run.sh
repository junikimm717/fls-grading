#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(realpath "$(dirname "$0" )" )"

PACKER_DIR="$ROOT_DIR/packer"
TF_DIR="$ROOT_DIR/terraform"

if [ ! -f "$TF_DIR/workers.auto.tfvars" ]; then
  echo "[iac] ERROR: terraform/workers.auto.tfvars not found"
  exit 1
fi

echo "[iac] starting infrastructure reconciliation"

#######################################
# Step 1: Build AMIs
#######################################

echo "[iac] building AMIs"
(
  cd "$PACKER_DIR"
  packer init .
  packer build .
)

#######################################
# Step 2: Apply Terraform
#######################################

echo "[iac] applying terraform"
(
  cd "$TF_DIR"
  terraform init
  terraform apply
)

echo "[iac] done"
