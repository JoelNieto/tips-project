#!/bin/sh
set -e
cd /app

if [ -n "${DATABASE_URL}" ]; then
  echo "Running database migrations..."
  prisma migrate deploy
fi

exec node main.js
