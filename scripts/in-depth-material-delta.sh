#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
REF="188c6938ecb2c6563ba228fd31b5fa4fc74b94e4"
mkdir -p scripts/.cache/in-depth
node scripts/in-depth-material-snapshot.mjs "$ROOT/scripts/.cache/in-depth/current-materials-exact.json"
git fetch --no-tags --depth=1 origin "$REF"
TEMP="$(mktemp -d)"
trap 'git worktree remove --force "$TEMP/reference" 2>/dev/null || true; rm -rf "$TEMP"' EXIT
git worktree add --detach "$TEMP/reference" "$REF"
cp scripts/in-depth-material-snapshot.mjs "$TEMP/reference/scripts/in-depth-material-snapshot.mjs"
ln -s "$ROOT/node_modules" "$TEMP/reference/node_modules"
(cd "$TEMP/reference" && node scripts/in-depth-material-snapshot.mjs "$ROOT/scripts/.cache/in-depth/reference-materials-exact.json")
node scripts/in-depth-material-delta.mjs scripts/.cache/in-depth/reference-materials-exact.json scripts/.cache/in-depth/current-materials-exact.json
