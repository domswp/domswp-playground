#!/usr/bin/env bash
# Idempotent bootstrap for the domswp-playground Cloud Agent environment.
# Installs dependencies for every experiment: Node (Vite), Python, Rust->WASM.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Node projects (Vite): threejs-orbit, iss-tracker"
for proj in threejs-orbit iss-tracker; do
  ( cd "$proj" && npm ci )
done

echo "==> Python projects: daily-news, space-weather, rocket-sim"
python3 -m pip install --user --upgrade pip >/dev/null
python3 -m pip install --user \
  -r daily-news/requirements.txt \
  -r space-weather/requirements.txt \
  -r rocket-sim/requirements.txt

echo "==> Rust WASM target + snake-rust build"
rustup target add wasm32-unknown-unknown
( cd snake-rust && ./build.sh dist )

echo "==> Install complete."
