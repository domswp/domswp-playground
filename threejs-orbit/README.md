# Orbit Viewer — Falcon 9 & Starship

Viewer 3D low-poly untuk eksplorasi roket SpaceX. Data massa/thrust/Isp selaras dengan `rocket-sim/04_falcon9_vs_starship.py`.

**Roadmap:** ISS live 3D (fase lanjutan) — folder ini tidak mengganggu `rocket-sim/` atau `daily-news/`.

## Fitur

- Orbit camera (drag, scroll zoom) — cocok mobile
- Pilih **Falcon 9**, **Starship**, **Saturn V**, atau **Soyuz-2.1a**, **SLS Block 1**
- **Klik stage** → panel info (massa, thrust, Δv perkiraan, TWR)
- **Simulasi staging** — pisahkan stage secara visual

## Menjalankan

```bash
cd threejs-orbit
npm install
npm run dev
```

Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173`).

## Build statis

```bash
npm run build
npm run preview
```

Output di `dist/` — deploy otomatis via GitHub Actions.

## Live (GitHub Pages)

- **Hub:** https://domswp.github.io/domswp-playground/
- **Orbit Viewer:** https://domswp.github.io/domswp-playground/threejs-orbit/

Portfolio utama (repo terpisah, tidak tertimpa):
https://domswp.github.io/profile-domswp/

## Struktur

```
src/
  main.js        — scene, controls, input
  buildRocket.js — mesh procedural
  rockets.js     — data + Tsiolkovsky
  ui.js          — panel info
```


## Simulasi + spesifikasi + kondisi

| Fitur | Keterangan |
|-------|------------|
| **Misi** | LEO, GTO, TLI — ubah payload & penilaian Δv |
| **Kondisi** | Normal / panas / dingin — pengali thrust |
| **Panel simulasi** | Liftoff mass, TWR, Δv total vs kebutuhan misi |
| **Staging** | Urutan event + animasi api |
| **Bandingkan** | Dua roket untuk misi & lingkungan yang sama |
| **Katalog JSON** | `data/rockets-catalog.json` (`npm run export-catalog`) |

Klik stage untuk spesifikasi stage dengan misi aktif.
