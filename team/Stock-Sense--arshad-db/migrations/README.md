#!/usr/bin/env bash
set -euo pipefail

# Docker mounts files from multiple directories separately, so this runner
# is not used by the container automatically. It is provided for manual use.
# Usage from the repository root:
#   psql "$DATABASE_URL" -f migrations/001_extensions.sql ...
#
# For Docker, files are mounted in lexicographic directory order and should
# be applied using an entrypoint wrapper in a real deployment.
