# AGENTS.md

## Cursor Cloud specific instructions

Playground repo (`domswp-playground`) — satu folder per eksperimen.

### Projects

| Folder | Stack | Notes |
|--------|-------|-------|
| `rocket-sim/` | Python, matplotlib, numpy | **Jangan ubah** kecuali user minta |
| `daily-news/` | Python, feedparser | RSS digest — `reports/` |
| `threejs-orbit/` | Vite, Three.js | Falcon 9 & Starship 3D viewer |

### GitHub Pages

- Hub: https://domswp.github.io/domswp-playground/
- Orbit Viewer: https://domswp.github.io/domswp-playground/threejs-orbit/
- Portfolio user (repo lain): https://domswp.github.io/profile-domswp/

Workflow: `.github/workflows/github-pages.yml` — deploy on push to `main`.

### threejs-orbit

```bash
cd threejs-orbit && npm install && npm run dev
```

Build Pages: `npm run build:pages`

### rocket-sim

```bash
cd rocket-sim && pip install -r requirements.txt && python3 01_tsiolkovsky.py
```

### daily-news

```bash
cd daily-news && pip install -r requirements.txt && python3 run_daily.py
```

### User context

- `profile.md`, `memory.md` — Bahasa Indonesia
