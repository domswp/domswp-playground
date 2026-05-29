# AGENTS.md

## Cursor Cloud specific instructions

Playground (`domswp-playground`) — satu folder per eksperimen.

### Projects

| Folder | Stack | Notes |
|--------|-------|-------|
| `rocket-sim/` | Python, matplotlib | **Jangan ubah** kecuali user minta |
| `daily-news/` | Python, feedparser | `python3 run_daily.py` → `reports/` |
| `threejs-orbit/` | Vite, Three.js | Orbit Viewer + simulasi misi |
| `iss-tracker/` | Vite, Three.js, satellite.js | ISS live 3D (TLE + wheretheiss.at) |
| `snake-rust/` | Rust → WASM (cdylib), JS+canvas | Game Snake, engine Rust, demo Pages |
| `meta-ads-planner/` | HTML/JS statis | Estimasi leads Meta Ads + targeting properti (rule-based) |

### GitHub Pages (repo public)

- Hub (**Lab Domas**): https://domswp.github.io/domswp-playground/ — hanya demo Pages di `docs/index.html`
- Orbit Viewer: https://domswp.github.io/domswp-playground/threejs-orbit/
- ISS Tracker: https://domswp.github.io/domswp-playground/iss-tracker/
- Snake (Rust/WASM): https://domswp.github.io/domswp-playground/snake-rust/
- Meta Ads Planner: https://domswp.github.io/domswp-playground/meta-ads-planner/
- Portfolio user (repo lain): https://domswp.github.io/profile-domswp/
- Deploy: branch `main`, folder `/docs` + workflow `github-pages.yml`

### threejs-orbit

```bash
cd threejs-orbit && npm install && npm run dev
npm run build:pages   # untuk GitHub Pages
npm run export-catalog  # data/rockets-catalog.json
```

- Roket: falcon9, starship, saturnv, soyuz, sls
- Panel simulasi **default collapsed** — jangan layout yang menutupi canvas
- Kode: `simulation.js`, `rocketMeta.js`, `ui.js`

### iss-tracker

```bash
cd iss-tracker && npm install && npm run dev
npm run build:pages
```

- TLE + `satellite.js` (SGP4), sinkron API ~45 dtk
- Panel telemetri **default collapsed**

### snake-rust

```bash
cd snake-rust && ./build.sh dist           # build lokal
./build.sh ../docs/snake-rust              # build untuk Pages
python3 -m http.server -d dist 8000        # tes lokal
```

- Engine game **murni Rust** (`src/lib.rs`, cdylib, **tanpa wasm-bindgen**) — C-ABI exports
- `main.js` baca grid dari memori WASM → gambar ke canvas; skor terbaik di `localStorage`
- Workflow Pages build ulang otomatis (rustup target wasm32)

### meta-ads-planner

```bash
cd meta-ads-planner && python3 -m http.server 8000   # statis, tanpa build
```

- Internal PP Properti. **Funnel mode** (CPM+CTR+CPL → CVR diturunkan), funnel hilir **wajib diisi**
- Targeting **rule-based** (`js/segments.js`, produk×segmen) — **tanpa AI** (AI = v2)
- Estimasi perencanaan, bukan garansi; interest = saran, validasi di Ads Manager

### daily-news

```bash
cd daily-news && pip install -r requirements.txt && python3 run_daily.py
```

### User context

- `profile.md`, `memory.md` — Bahasa Indonesia
