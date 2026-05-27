# Daily News Digest

Berita harian terpisah dari project `rocket-sim/` — tidak mengganggu belajar fisika roket.

## Apa yang dilakukan

1. **Scrape** headline dari RSS (Antara, BBC Indonesia, Tempo, CNN Indonesia, Hacker News)
2. **Analisis** ringkas otomatis (tema ramai, distribusi sumber)
3. **Kontradiksi** — deteksi headline lintas sumber dengan topik overlap / framing berbeda
4. **Laporan** disimpan di `reports/YYYY-MM-DD.md` (mudah dibaca di GitHub / mobile)

## Cara baca (untuk Domas)

- Buka folder [`reports/`](reports/) — satu file per hari
- Aktifkan **notifikasi GitHub** untuk repo ini (Watch → All Activity) supaya dapat push saat laporan baru di-commit otomatis

## Jalankan manual

```bash
cd daily-news
pip install -r requirements.txt
python3 run_daily.py
```

## Analisis lebih dalam (opsional)

Set `OPENAI_API_KEY` di GitHub Secrets (untuk workflow) atau lokal:

```bash
export OPENAI_API_KEY=sk-...
pip install openai   # opsional, tidak wajib
python3 run_daily.py
```

Tanpa API key, laporan tetap jadi — analisis otomatis + deteksi kontradiksi tetap ada.

## Otomatis setiap hari

GitHub Actions (`.github/workflows/daily-news.yml`) jalan **07:00 WIB** setiap hari, commit laporan baru ke branch `main`.

## Menambah sumber

Edit `config.py` → daftar `FEEDS`. Pastikan URL RSS resmi dan boleh diakses.
