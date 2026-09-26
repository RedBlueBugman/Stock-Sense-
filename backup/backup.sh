#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
TIMESTAMP="$(date -u +%Y%m%d_%H%M%S)"
FILE="${BACKUP_DIR}/stocksense_${TIMESTAMP}.dump"

: "${POSTGRES_DB:=stocksense}"
: "${POSTGRES_USER:=stocksense}"
: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"

pg_dump \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --format=custom \
  --file="$FILE" \
  "$POSTGRES_DB"

echo "Backup created: $FILE"
