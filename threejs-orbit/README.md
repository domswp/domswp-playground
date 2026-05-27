# Orbit Viewer — Falcon 9 & Starship

Viewer 3D low-poly untuk eksplorasi roket SpaceX. Data massa/thrust/Isp selaras dengan `rocket-sim/04_falcon9_vs_starship.py`.

**Roadmap:** ISS live 3D (fase lanjutan) — folder ini tidak mengganggu `rocket-sim/` atau `daily-news/`.

## Fitur

- Orbit camera (drag, scroll zoom) — cocok mobile
- Pilih **Falcon 9** atau **Starship + Super Heavy**
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

Output di `dist/` — bisa di-deploy ke GitHub Pages.

## Struktur

```
src/
  main.js        — scene, controls, input
  buildRocket.js — mesh procedural
  rockets.js     — data + Tsiolkovsky
  ui.js          — panel info
```
