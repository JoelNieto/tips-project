#!/bin/sh
set -e
cd /app

if [ -z "${DATABASE_URL}" ]; then
  echo "ERROR: DATABASE_URL is not set on this service. Add it in Railway → web-server → Variables."
  exit 1
fi

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy

exec node main.js
