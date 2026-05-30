# Space Weather Monitor

Dashboard cuaca antariksa dengan **deteksi anomali**, di-deploy gratis di GitHub Pages.

**Live:** https://domswp.github.io/domswp-playground/space-weather/

## Konsep

GitHub Pages hanya menyajikan file statis — **tidak ada Python yang jalan saat halaman dibuka**. Jadi arsitekturnya:

```
GitHub Actions (cron harian, 08:00 WIB)
  └─ jalankan pipeline Python:
       fetch_data.py  →  detect.py  →  build_dashboard.py
                                            │
                                            ▼
                              docs/space-weather/index.html  (statis, self-contained)
  └─ commit & push HTML hasilnya
GitHub Pages  →  serve index.html itu apa adanya
```

Halaman yang dibuka pengunjung = "snapshot" hasil pipeline terakhir. Tidak perlu server, tidak perlu API call dari browser.

## Yang dilakukan

1. **`fetch_data.py`** — ambil data dari [NASA DONKI](https://api.nasa.gov):
   - `FLR` (solar flare / suar matahari)
   - `GST` (geomagnetic storm / badai geomagnetik — berisi indeks Kp)

   Lalu parse JSON nested → time-series **harian**. Metrik utama: **jumlah flare per hari** (`flare_count`). Disertai konteks `kp_max` (Kp tertinggi/hari) dan `flare_max_class` (kekuatan flare terkuat/hari).

2. **`detect.py`** — deteksi anomali pada metrik utama. Dua metode:
   - `zscore` (default) — rolling mean + z-score (sederhana & transparan)
   - `iforest` — Isolation Forest dari scikit-learn (berbasis ML)

3. **`build_dashboard.py`** — render `index.html` **self-contained** dengan Plotly (plotly.js ditanam inline, tanpa CDN). Grafik garis time-series dengan titik anomali ber-warna beda + garis konteks Kp di sumbu kanan.

## Jalankan manual (lokal)

```bash
cd space-weather
pip install -r requirements.txt

# pakai API key sendiri (disarankan; DEMO_KEY rate limit-nya ketat)
export NASA_API_KEY=xxxxxxxx   # ambil gratis di https://api.nasa.gov

python3 run.py                  # metode default (z-score)
python3 run.py --method iforest # pakai Isolation Forest
python3 run.py --use-cache      # pakai data CSV yang sudah ada (tanpa panggil API)
```

Output: `docs/space-weather/index.html`. Buka langsung di browser untuk melihat hasilnya.

Tanpa `NASA_API_KEY`, pipeline tetap jalan memakai `DEMO_KEY` (cukup untuk uji coba, tapi mudah kena rate limit).

## Otomatis setiap hari

GitHub Actions (`.github/workflows/space-weather.yml`) jalan **08:00 WIB** tiap hari, menjalankan pipeline dan commit `docs/space-weather/index.html` yang baru.

### Set API key sebagai secret

1. Ambil API key gratis di https://api.nasa.gov.
2. Di repo: **Settings → Secrets and variables → Actions → New repository secret**.
3. Nama: `NASA_API_KEY`, isi: key kamu.

Workflow membaca secret itu via `env: NASA_API_KEY`.

## Struktur

```
space-weather/
├── fetch_data.py        # ambil + parse DONKI → time-series harian
├── detect.py            # deteksi anomali (z-score / Isolation Forest)
├── build_dashboard.py   # render index.html (Plotly, self-contained)
├── run.py               # orkestrator: fetch → detect → build
├── config.py            # semua konstanta (endpoint, window, threshold, path)
├── requirements.txt
└── data/                # cache JSON + CSV (gitignored)
```

## Catatan

- Data dari NASA DONKI = perkiraan untuk **edukasi/visual**, bukan peringatan cuaca antariksa resmi.
- Ubah parameter (rentang hari, window z-score, threshold, contamination) di `config.py`.
