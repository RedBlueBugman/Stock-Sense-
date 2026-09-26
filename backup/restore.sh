#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: ./restore.sh ./backup/stocksense_YYYYMMDD_HHMMSS.dump"
  exit 1
fi

: "${POSTGRES_DB:=stocksense}"
: "${POSTGRES_USER:=stocksense}"
: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"

pg_restore \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --clean \
  --if-exists \
  "$1"

echo "Restore completed."
