"""
run.py — orkestrator pipeline Space Weather Monitor.

Jalankan ketiga tahap berurutan:
    fetch_data  →  detect  →  build_dashboard

Contoh pemakaian:
    python3 run.py                      # metode default (z-score)
    python3 run.py --method iforest     # pakai Isolation Forest
    python3 run.py --use-cache          # pakai data CSV yang sudah ada (tanpa panggil API)
"""

from __future__ import annotations

import argparse

import build_dashboard
import config
import detect
import fetch_data


def main() -> None:
    parser = argparse.ArgumentParser(description="Space Weather Monitor pipeline")
    parser.add_argument(
        "--method",
        choices=["zscore", "iforest"],
        default=config.DEFAULT_METHOD,
        help="metode deteksi anomali (default: %(default)s)",
    )
    parser.add_argument(
        "--use-cache",
        action="store_true",
        help="pakai time-series CSV yang sudah ada, jangan panggil API NASA",
    )
    args = parser.parse_args()

    print(f"=== Space Weather Monitor (method={args.method}) ===")
    timeseries = fetch_data.get_timeseries(use_cache=args.use_cache)
    flagged = detect.detect(timeseries, method=args.method)
    build_dashboard.build(flagged, method=args.method)
    print("=== selesai ===")


if __name__ == "__main__":
    main()
