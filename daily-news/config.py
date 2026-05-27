"""Konfigurasi sumber berita dan perilaku laporan harian."""

from __future__ import annotations

USER_AGENT = (
    "domswp-playground-daily-news/1.0 "
    "(personal digest; https://github.com/domswp/domswp-playground)"
)

# Maks artikel per feed (supaya laporan tidak terlalu panjang di mobile)
MAX_PER_FEED = 12

# Sumber RSS — fokus Indonesia + sedikit teknologi internasional
FEEDS: list[dict[str, str]] = [
    {"name": "Antara", "url": "https://www.antaranews.com/rss/terkini.xml", "lang": "id"},
    {"name": "BBC Indonesia", "url": "https://feeds.bbci.co.uk/indonesia/rss.xml", "lang": "id"},
    {"name": "Tempo", "url": "https://rss.tempo.co/nasional", "lang": "id"},
    {"name": "CNN Indonesia", "url": "https://www.cnnindonesia.com/nasional/rss", "lang": "id"},
    {"name": "Hacker News", "url": "https://news.ycombinator.com/rss", "lang": "en"},
]

# Kata kunci untuk mengelompokkan topik lintas sumber
TOPIC_SEEDS = (
    "prabowo", "jokowi", "pilpres", "dpr", "mk", "mahkamah",
    "iran", "israel", "gaza", "ukraina", "rusia", "as ", "amerika",
    "ekonomi", "rupiah", "bank", "inflasi", "subsidi",
    "cuaca", "banjir", "gempa", "bmkg",
    "ai", "openai", "google", "microsoft", "teknologi",
)

# Pasangan kata yang sering menandakan framing berbeda (untuk deteksi kontradiksi ringan)
OPPOSING_PAIRS: list[tuple[str, str]] = [
    ("naik", "turun"),
    ("meningkat", "menurun"),
    ("setuju", "menolak"),
    ("dukung", "tolak"),
    ("optimis", "pesimis"),
    ("menang", "kalah"),
    ("buka", "tutup"),
    ("longgarkan", "perketat"),
    ("pro", "kontra"),
]

REPORTS_DIR = "reports"
RAW_DIR = "raw"
