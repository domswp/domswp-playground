# ISS Tracker

Globe 3D (Three.js) dengan posisi **International Space Station** yang diperbarui secara live di browser.

## Cara kerja

1. **TLE** dari [wheretheiss.at](https://wheretheiss.at/w/developer) → propagasi orbit **SGP4** via [`satellite.js`](https://github.com/shashwatak/satellite-js) setiap frame (gerakan halus).
2. **API REST** tiap ~45 detik → telemetri (visibilitas, kecepatan) + koreksi waktu kecil agar tetap selaras dengan sumber live.
3. TLE di-refresh otomatis tiap 6 jam.

## Menjalankan

```bash
cd iss-tracker
npm install
npm run dev
```

Buka URL yang ditampilkan Vite (port default **5174**).

## Build GitHub Pages

```bash
npm run build:pages
```

Output di `dist/` — workflow repo menyalin ke `docs/iss-tracker/`.

## Catatan

- Data **bukan** telemetri resmi NASA; untuk edukasi & hobi.
- Butuh koneksi internet (API + texture Bumi dari CDN).
- Panel **Telemetri** default tertutup agar globe tidak tertutup di mobile.
