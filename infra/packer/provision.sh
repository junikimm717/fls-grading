#!/usr/bin/env bash
set -euo pipefail

ARCH="$(uname -m)"

echo "[packer] provisioning grader AMI"

# I can't believe there is a fucking race here.

# Wait for cloud-init to finish apt setup
if command -v cloud-init >/dev/null 2>&1; then
  cloud-init status --wait
fi

# Reset apt state (cloud-init race workaround)
rm -rf /var/lib/apt/lists/*
mkdir -p /var/lib/apt/lists/partial
apt-get clean

# Docker
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release

curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# Docker Compose v2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-linux-${ARCH} \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Worker directory
mkdir -p /opt/fls
chown -R ubuntu:ubuntu /opt/fls

# Drop docker-compose.yml
cat >/opt/fls/docker-compose.yml <<'EOF'
services:
  fls-worker:
    image: ghcr.io/junikimm717/fls-grading/worker
    container_name: fls-grading-worker
    restart: unless-stopped
    init: true

    env_file:
      - .env

    environment:
      FLS_GRADING_BASEURL: "https://6s913.mit.junic.kim"
      FLS_GRADING_GRADER: "ghcr.io/junikimm717/fls-grading/grader"
      FLS_GRADING_BUILDER: "ghcr.io/junikimm717/fls-grading/dev"
      FLS_HOST_ROOT: "/opt/fls"
      FLS_MOUNT_PREFIX: "/files"

    volumes:
      - /opt/fls:/files
      - /var/run/docker.sock:/var/run/docker.sock
EOF

# Update script
cat >/opt/fls/update.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd /opt/fls
docker compose pull
docker compose up -d
EOF

chmod +x /opt/fls/update.sh
