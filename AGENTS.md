# AGENTS.md

## Cursor Cloud specific instructions

Playground repo (`domswp-playground`) — satu folder per eksperimen.

### Projects

| Folder | Stack | Notes |
|--------|-------|-------|
| `rocket-sim/` | Python, matplotlib, numpy | **Jangan ubah** kecuali user minta |
| `daily-news/` | Python, feedparser | RSS digest — `reports/` |
| `threejs-orbit/` | Vite, Three.js | Falcon 9 & Starship 3D viewer |

### threejs-orbit

```bash
cd threejs-orbit && npm install && npm run dev
```

Port default: 5173. Roadmap user: ISS live 3D (belum diimplementasi).

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
