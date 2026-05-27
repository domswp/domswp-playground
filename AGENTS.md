# AGENTS.md

## Cursor Cloud specific instructions

Playground repo (`domswp-playground`) untuk eksperimen terpisah per folder.

### Projects

| Folder | Stack | Notes |
|--------|-------|-------|
| `rocket-sim/` | Python, matplotlib, numpy | Rocket physics tutorials — **jangan ubah** kecuali user minta |
| `daily-news/` | Python, feedparser, requests | RSS digest harian — laporan di `daily-news/reports/` |

### daily-news

```bash
cd daily-news && pip install -r requirements.txt && python3 run_daily.py
```

- Otomatis: GitHub Actions `daily-news.yml` — 07:00 WIB
- Opsional: `OPENAI_API_KEY` untuk analisis LLM lebih dalam

### rocket-sim

```bash
cd rocket-sim && pip install -r requirements.txt && python3 01_tsiolkovsky.py
```

### User context

- Profil: `profile.md`
- Memory / preferensi: `memory.md` (Bahasa Indonesia, folder terpisah per project)
