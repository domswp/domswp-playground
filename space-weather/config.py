"""
Konfigurasi terpusat untuk Space Weather Monitor.

Semua "angka ajaib" (endpoint, rentang hari, parameter deteksi, path output)
dikumpulkan di sini supaya gampang diubah tanpa menyentuh logika di file lain.
"""

from __future__ import annotations

import os
from pathlib import Path

# --- API NASA DONKI -------------------------------------------------------
# DONKI = Space Weather Database Of Notifications, Knowledge, Information.
# Dokumentasi: https://api.nasa.gov (bagian DONKI).
DONKI_BASE = "https://api.nasa.gov/DONKI"

# Endpoint yang dipakai:
#   FLR = Solar Flare (suar matahari)
#   GST = Geomagnetic Storm (badai geomagnetik, berisi indeks Kp)
ENDPOINT_FLR = "FLR"
ENDPOINT_GST = "GST"

# API key diambil dari environment variable. Kalau tidak ada, pakai DEMO_KEY
# (bisa jalan tapi rate limit-nya ketat — cukup untuk uji coba).
NASA_API_KEY = os.environ.get("NASA_API_KEY", "DEMO_KEY")

# Rentang data yang diambil (hari ke belakang dari hari ini).
LOOKBACK_DAYS = 365

# Timeout per request (detik) supaya pipeline tidak menggantung.
REQUEST_TIMEOUT = 30

# --- Metrik harian --------------------------------------------------------
# Metrik UTAMA untuk deteksi anomali = jumlah solar flare per hari.
# Sinyal "count" yang bersih, intuitif, dan cocok untuk z-score / Isolation Forest.
PRIMARY_METRIC = "flare_count"

# --- Parameter deteksi anomali -------------------------------------------
# Metode default: rolling mean + z-score.
ZSCORE_WINDOW = 30  # jumlah hari untuk rata-rata bergerak
ZSCORE_THRESHOLD = 3.0  # |z| di atas ini dianggap anomali

# Metode alternatif: Isolation Forest (scikit-learn).
IFOREST_CONTAMINATION = 0.05  # perkiraan proporsi titik anomali (5%)
IFOREST_RANDOM_STATE = 42  # supaya hasil reproducible

# Pilihan metode default kalau dijalankan tanpa argumen: "zscore" atau "iforest".
DEFAULT_METHOD = "zscore"

# --- Path -----------------------------------------------------------------
HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / "data"  # cache JSON mentah + CSV time-series (gitignored)
RAW_FLR_JSON = DATA_DIR / "flr_raw.json"
RAW_GST_JSON = DATA_DIR / "gst_raw.json"
TIMESERIES_CSV = DATA_DIR / "timeseries.csv"

# Output dashboard: langsung ke folder docs/ supaya di-serve GitHub Pages.
# docs/ ada di root repo (satu tingkat di atas folder space-weather/).
REPO_ROOT = HERE.parent
OUTPUT_HTML = REPO_ROOT / "docs" / "space-weather" / "index.html"
