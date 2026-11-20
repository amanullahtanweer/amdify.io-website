#!/usr/bin/env bash
# Deploy the amdify.io website to the self-hosted Docker server.
# Usage: ./scripts/deploy.sh            (uploads working tree, rebuilds, restarts)
set -euo pipefail
HOST=root@91.98.168.202
DIR=/root/amdify-website
cd "$(dirname "$0")/.."
COPYFILE_DISABLE=1 tar --exclude=node_modules --exclude=dist --exclude=.astro --exclude=.git \
  --exclude='.env*' --exclude='._*' --exclude=.DS_Store -czf - . \
  | ssh "$HOST" "mkdir -p $DIR && tar -xzf - -C $DIR 2>/dev/null"
ssh "$HOST" "cd $DIR && docker compose build -q && docker compose up -d && sleep 5 && docker ps --filter name=amdify-website --format '{{.Status}}'"
