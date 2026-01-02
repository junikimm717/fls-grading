#!/bin/sh

set -eu
# entrypoint for the docker container.
cd /app
npx drizzle-kit push
npm start
