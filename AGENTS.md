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

### GitHub Pages (repo public)

- Hub: https://domswp.github.io/domswp-playground/
- Orbit Viewer: https://domswp.github.io/domswp-playground/threejs-orbit/
- ISS Tracker: https://domswp.github.io/domswp-playground/iss-tracker/
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

### daily-news

```bash
cd daily-news && pip install -r requirements.txt && python3 run_daily.py
```

### User context

- `profile.md`, `memory.md` — Bahasa Indonesia
