"""
fetch_data.py — ambil data cuaca antariksa dari NASA DONKI dan ubah
menjadi time-series HARIAN yang bersih.

Alur:
  1. Panggil 2 endpoint DONKI:
       - FLR  : solar flare (suar matahari)
       - GST  : geomagnetic storm (berisi indeks Kp)
  2. Parse JSON yang ber-sarang (nested) menjadi tabel datar (DataFrame).
  3. Resample ke frekuensi harian:
       - flare_count     : jumlah flare per hari  (METRIK UTAMA)
       - flare_max_class : kekuatan flare terkuat per hari (skor numerik)
       - kp_max          : indeks Kp tertinggi per hari (konteks badai geomagnetik)

Hari tanpa kejadian diisi 0 — penting supaya time-series-nya rapat (tiap hari
ada nilainya), sehingga deteksi anomali bisa mengenali "lonjakan" dengan benar.
"""

from __future__ import annotations

import datetime as dt
import json
from typing import Any

import pandas as pd
import requests

import config


# --------------------------------------------------------------------------
# 1. Panggil API
# --------------------------------------------------------------------------
def _request(endpoint: str, start: str, end: str) -> list[dict[str, Any]]:
    """Panggil satu endpoint DONKI dan kembalikan list event (JSON).

    DONKI mengembalikan array JSON; tiap elemen = satu kejadian.
    Kalau ada error / rate limit, API kadang mengembalikan dict berisi pesan,
    jadi kita jaga-jaga dan kembalikan list kosong bila bukan list.
    """
    url = f"{config.DONKI_BASE}/{endpoint}"
    params = {
        "startDate": start,
        "endDate": end,
        "api_key": config.NASA_API_KEY,
    }
    resp = requests.get(url, params=params, timeout=config.REQUEST_TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    if not isinstance(data, list):
        # Misal {"error": {...}} atau pesan rate limit → anggap tidak ada data.
        print(f"[fetch] peringatan: respons {endpoint} bukan list: {str(data)[:120]}")
        return []
    return data


def fetch_raw(start: str, end: str) -> tuple[list, list]:
    """Ambil data mentah FLR & GST, simpan ke cache JSON, kembalikan keduanya."""
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[fetch] FLR {start} → {end} ...")
    flr = _request(config.ENDPOINT_FLR, start, end)
    config.RAW_FLR_JSON.write_text(json.dumps(flr, indent=2))
    print(f"[fetch]   {len(flr)} kejadian flare")

    print(f"[fetch] GST {start} → {end} ...")
    gst = _request(config.ENDPOINT_GST, start, end)
    config.RAW_GST_JSON.write_text(json.dumps(gst, indent=2))
    print(f"[fetch]   {len(gst)} kejadian badai geomagnetik")

    return flr, gst


# --------------------------------------------------------------------------
# 2. Parse JSON nested → tabel datar
# --------------------------------------------------------------------------
# Kelas flare diberi urutan A < B < C < M < X (tiap huruf ~10x lebih kuat).
# Kita ubah jadi skor numerik kontinu supaya bisa di-plot & dibandingkan:
#   skor = index_huruf + angka/10   →  contoh "X2.0" = 4 + 0.2 = 4.2
_CLASS_ORDER = "ABCMX"


def _class_to_score(class_type: str | None) -> float:
    """Ubah label kelas flare (mis. 'X1.5', 'M2', 'C3.1') jadi skor numerik."""
    if not class_type:
        return 0.0
    letter = class_type[0].upper()
    if letter not in _CLASS_ORDER:
        return 0.0
    base = _CLASS_ORDER.index(letter)  # A=0, B=1, C=2, M=3, X=4
    # Sisa string setelah huruf = besaran dalam kelas itu (mis. "1.5").
    try:
        magnitude = float(class_type[1:])
    except (ValueError, IndexError):
        magnitude = 0.0
    # Batasi ke <10 lalu bagi 10 supaya jadi pecahan di dalam satu kelas.
    return base + min(magnitude, 9.9) / 10.0


def parse_flares(flr: list[dict[str, Any]]) -> pd.DataFrame:
    """FLR mentah → DataFrame kolom: date (harian), class_score."""
    rows = []
    for ev in flr:
        # Pakai peakTime (puncak flare); kalau kosong pakai beginTime.
        ts = ev.get("peakTime") or ev.get("beginTime")
        if not ts:
            continue
        # Timestamp DONKI berformat ISO mis. "2024-05-10T06:54Z".
        when = pd.to_datetime(ts, utc=True, errors="coerce")
        if pd.isna(when):
            continue
        rows.append(
            {
                "date": when.normalize().tz_localize(None),  # potong jam → tanggal saja
                "class_score": _class_to_score(ev.get("classType")),
            }
        )
    return pd.DataFrame(rows, columns=["date", "class_score"])


def parse_storms(gst: list[dict[str, Any]]) -> pd.DataFrame:
    """GST mentah → DataFrame kolom: date (harian), kp.

    Tiap kejadian GST punya daftar 'allKpIndex' (beberapa pembacaan Kp pada
    waktu berbeda). Kita ratakan (flatten) jadi satu baris per pembacaan.
    """
    rows = []
    for ev in gst:
        for kp_reading in ev.get("allKpIndex", []) or []:
            ts = kp_reading.get("observedTime")
            kp = kp_reading.get("kpIndex")
            if ts is None or kp is None:
                continue
            when = pd.to_datetime(ts, utc=True, errors="coerce")
            if pd.isna(when):
                continue
            rows.append(
                {
                    "date": when.normalize().tz_localize(None),
                    "kp": float(kp),
                }
            )
    return pd.DataFrame(rows, columns=["date", "kp"])


# --------------------------------------------------------------------------
# 3. Resample ke time-series harian
# --------------------------------------------------------------------------
def build_daily_timeseries(
    flares: pd.DataFrame, storms: pd.DataFrame, start: str, end: str
) -> pd.DataFrame:
    """Gabungkan flare + storm jadi satu DataFrame harian yang rapat.

    Indeks = setiap hari dari start..end (tanpa bolong). Hari tanpa kejadian
    diisi 0 supaya deteksi anomali melihat "tidak ada aktivitas" sebagai nilai
    nyata, bukan data hilang.
    """
    # Kerangka tanggal harian penuh (inklusif).
    full_index = pd.date_range(start=start, end=end, freq="D", name="date")
    daily = pd.DataFrame(index=full_index)

    # --- METRIK UTAMA: jumlah flare per hari ---
    if not flares.empty:
        flare_count = flares.groupby("date").size()
        flare_max = flares.groupby("date")["class_score"].max()
    else:
        flare_count = pd.Series(dtype="int64")
        flare_max = pd.Series(dtype="float64")

    daily["flare_count"] = flare_count.reindex(full_index, fill_value=0).astype(int)
    daily["flare_max_class"] = flare_max.reindex(full_index, fill_value=0.0)

    # --- KONTEKS: Kp maksimum per hari ---
    if not storms.empty:
        kp_max = storms.groupby("date")["kp"].max()
    else:
        kp_max = pd.Series(dtype="float64")
    daily["kp_max"] = kp_max.reindex(full_index, fill_value=0.0)

    return daily


# --------------------------------------------------------------------------
# Entry point yang dipakai modul lain
# --------------------------------------------------------------------------
def get_timeseries(use_cache: bool = False) -> pd.DataFrame:
    """Kembalikan time-series harian. Jika use_cache, baca dari CSV bila ada."""
    if use_cache and config.TIMESERIES_CSV.exists():
        print("[fetch] memakai cache time-series CSV")
        return pd.read_csv(config.TIMESERIES_CSV, index_col="date", parse_dates=["date"])

    today = dt.date.today()
    start = (today - dt.timedelta(days=config.LOOKBACK_DAYS)).isoformat()
    end = today.isoformat()

    flr, gst = fetch_raw(start, end)
    flares = parse_flares(flr)
    storms = parse_storms(gst)
    daily = build_daily_timeseries(flares, storms, start, end)

    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    daily.to_csv(config.TIMESERIES_CSV)
    print(f"[fetch] time-series harian: {len(daily)} hari → {config.TIMESERIES_CSV}")
    return daily


if __name__ == "__main__":
    df = get_timeseries()
    print(df.tail(10))
