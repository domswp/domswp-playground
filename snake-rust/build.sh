#!/usr/bin/env bash
# Build WASM dan salin aset statis ke folder output.
# Pemakaian: ./build.sh [output_dir]   (default: dist)
set -euo pipefail
cd "$(dirname "$0")"

OUT="${1:-dist}"

rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true
cargo build --target wasm32-unknown-unknown --release

mkdir -p "$OUT"
cp index.html main.js style.css "$OUT/"
cp target/wasm32-unknown-unknown/release/snake_rust.wasm "$OUT/snake.wasm"

echo "Build selesai → $OUT/"
