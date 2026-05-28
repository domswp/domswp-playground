# AGENTS.md

## Cursor Cloud specific instructions

Playground (`domswp-playground`) — satu folder per eksperimen.

### Projects

| Folder | Stack | Notes |
|--------|-------|-------|
| `rocket-sim/` | Python, matplotlib | **Jangan ubah** kecuali user minta |
| `daily-news/` | Python, feedparser | `python3 run_daily.py` → `reports/` |
| `threejs-orbit/` | Vite, Three.js | Orbit Viewer + simulasi misi |

### GitHub Pages (repo public)

- Hub: https://domswp.github.io/domswp-playground/
- Orbit Viewer: https://domswp.github.io/domswp-playground/threejs-orbit/
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

### daily-news

```bash
cd daily-news && pip install -r requirements.txt && python3 run_daily.py
```

### User context

- `profile.md`, `memory.md` — Bahasa Indonesia
