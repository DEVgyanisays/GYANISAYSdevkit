#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if [ ! -f .env ]; then
  echo 'Copy .env.example to .env, fill domain and credentials, then rerun.' >&2
  exit 1
fi
if grep -q 'CHANGE_ME' .env; then
  echo 'Replace every CHANGE_ME value in .env before deployment.' >&2
  exit 1
fi
if [ ! -f nginx/certs/fullchain.pem ] || [ ! -f nginx/certs/privkey.pem ]; then
  echo 'Install your domain TLS certificate and key in nginx/certs first. See docs/DEPLOYMENT.md.' >&2
  exit 1
fi
docker compose -f docker-compose.yml -f docker-compose.https.yml config --quiet
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.https.yml ps
echo 'Containers started. Verify the public form, admin login, MySQL lead storage and actual email delivery.'
