# 6.S913 Grading worker

Grading worker for 6.S913. Proper functioning requires admin key access to the
portal at [6s913.mit.junic.kim](https://6s913.mit.junic.kim).

Note this code calls docker inside a docker container, so it will borrow the
host docker daemon's docker socket.

```sh
set -eu
DIR="$(realpath "$(dirname "$0" )" )"
cd "$DIR"
# Note if you are on a dev environment and not using docker, these two variables
# are the **same**.
FLS_HOST_ROOT="$DIR/files"
FLS_MOUNT_PREFIX="/files"

docker run --rm \
  --env-file ./env.prod \
  -e FLS_HOST_ROOT="$FLS_HOST_ROOT" \
  -e FLS_MOUNT_PREFIX="$FLS_MOUNT_PREFIX" \
  -v "$FLS_HOST_ROOT":"$FLS_MOUNT_PREFIX" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -it ${IMAGE_NAME}
```

## Setup

Make sure to install uv, then set it up like a standard project.

```bash
uv venv
uv pip install -e .
source .venv/bin/activate
cp .env.example .env
# after editing the env file
fls-worker
```

You will need to configure the `.env` file, especially the admin api key.
