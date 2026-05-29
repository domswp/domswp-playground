# Snake (Rust + WASM)

Game Snake klasik dengan **engine ditulis di Rust**, di-compile ke **WebAssembly**, berjalan penuh di browser (cocok untuk GitHub Pages).

## Arsitektur

- **Rust (`src/lib.rs`)** — seluruh logika game: gerak ular, makan, tabrakan, skor, posisi makanan (PRNG xorshift). Di-compile sebagai `cdylib` murni (tanpa wasm-bindgen).
- **JS tipis (`main.js`)** — load `.wasm`, baca grid dari memori linear WASM, gambar ke `<canvas>`, tangani input (panah/WASD/swipe/tombol), simpan skor terbaik di `localStorage`.

Komunikasi via fungsi C-ABI: `init`, `set_dir`, `tick`, `restart`, `score`, `is_over`, `grid_ptr`, `grid_len`.

## Build

```bash
cd snake-rust
./build.sh            # → dist/
# atau untuk GitHub Pages:
./build.sh ../docs/snake-rust
```

Butuh Rust + target `wasm32-unknown-unknown` (script menambahkannya otomatis).

## Jalankan lokal

```bash
./build.sh
python3 -m http.server -d dist 8000
# buka http://localhost:8000
```

## Kontrol

- **Desktop:** panah atau WASD
- **Mobile:** tombol arah atau swipe di papan
- **Restart:** tombol "Main lagi", Spasi/Enter, atau ketuk overlay
