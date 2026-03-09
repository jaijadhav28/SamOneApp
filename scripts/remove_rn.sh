#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

git checkout -b convert-to-web || git checkout convert-to-web || true
mkdir -p backup/rn_files

items=(ios android "App.js" "index.js" app.json metro.config.js react-native.config.js babel.config.js "__tests__")
for f in "${items[@]}"; do
  if [ -e "$f" ]; then
    mv "$f" backup/rn_files/
    echo "Moved: $f -> backup/rn_files/"
  fi
done

if [ -d "node_modules" ]; then
  echo "Removing node_modules (you can reinstall later)..."
  rm -rf node_modules
fi

echo ""
echo "Backup of RN files created at: $(pwd)/backup/rn_files"
echo "Script finished."
