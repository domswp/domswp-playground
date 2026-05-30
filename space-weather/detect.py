"""
detect.py — deteksi anomali pada time-series harian.

Dua metode (bisa dipilih lewat argumen `method`):

  1. "zscore"  (default) — rolling mean + z-score.
     Ide: hitung rata-rata & simpangan baku BERGERAK (window N hari terakhir).
     Sebuah titik dianggap anomali kalau dia jauh dari rata-rata lokalnya,
     diukur dalam satuan simpangan baku (z). |z| > threshold → anomali.
     Kelebihan: sederhana, transparan, gampang dijelaskan.

  2. "iforest" — Isolation Forest (scikit-learn).
     Ide: algoritma membangun banyak pohon acak yang "mengisolasi" titik.
     Titik anomali cenderung terisolasi lebih cepat (kedalaman pohon dangkal).
     Kelebihan: berbasis ML, menangkap pola yang lebih halus tanpa kita
     menentukan threshold manual.

Output kedua metode sama bentuknya: DataFrame asli + 2 kolom baru:
  - is_anomaly (bool) : True kalau titik itu anomali
  - score (float)     : skor anomali (z untuk zscore; -score IF untuk iforest)
"""

from __future__ import annotations

import pandas as pd
from sklearn.ensemble import IsolationForest

import config


def detect_zscore(
    series: pd.Series,
    window: int = config.ZSCORE_WINDOW,
    threshold: float = config.ZSCORE_THRESHOLD,
) -> pd.DataFrame:
    """Deteksi anomali dengan rolling mean + z-score.

    Parameter:
      series    : nilai metrik harian (indeks = tanggal)
      window    : panjang jendela rata-rata bergerak (hari)
      threshold : ambang |z| untuk menandai anomali
    """
    # Rata-rata & simpangan baku bergerak.
    # min_periods=window → jangan hitung z sebelum jendela terisi penuh,
    # supaya estimasi awal tidak bias karena datanya sedikit.
    rolling = series.rolling(window=window, min_periods=window)
    mean = rolling.mean()
    std = rolling.std()

    # z = (nilai - rata2 lokal) / simpangan baku lokal.
    # Kalau std = 0 (nilai datar), z tidak terdefinisi → kita anggap 0 (bukan anomali).
    z = (series - mean) / std
    z = z.replace([float("inf"), float("-inf")], 0.0).fillna(0.0)

    out = pd.DataFrame(index=series.index)
    out["score"] = z
    out["is_anomaly"] = z.abs() > threshold
    return out


def detect_iforest(
    series: pd.Series,
    contamination: float = config.IFOREST_CONTAMINATION,
    random_state: int = config.IFOREST_RANDOM_STATE,
) -> pd.DataFrame:
    """Deteksi anomali dengan Isolation Forest.

    Parameter:
      contamination : perkiraan proporsi data yang anomali (mis. 0.05 = 5%).
                      Dipakai model untuk menentukan ambang internal.
      random_state  : seed acak supaya hasilnya konsisten tiap dijalankan.
    """
    # scikit-learn ingin input 2D: (n_samples, n_features). Metrik kita 1 fitur,
    # jadi kita ubah jadi kolom tunggal.
    X = series.to_numpy().reshape(-1, 1)

    model = IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_estimators=200,  # jumlah pohon; lebih banyak = lebih stabil
    )
    # predict: +1 = normal, -1 = anomali.
    labels = model.fit_predict(X)
    # decision_function: makin kecil (negatif) makin anomali.
    # Kita balik tandanya supaya "skor besar = lebih anomali", senada zscore.
    raw_score = -model.decision_function(X)

    out = pd.DataFrame(index=series.index)
    out["score"] = raw_score
    out["is_anomaly"] = labels == -1
    return out


def detect(
    df: pd.DataFrame,
    metric: str = config.PRIMARY_METRIC,
    method: str = config.DEFAULT_METHOD,
) -> pd.DataFrame:
    """Jalankan deteksi pada satu metrik dan tempelkan hasilnya ke DataFrame.

    Mengembalikan salinan `df` dengan tambahan kolom `is_anomaly` dan `score`.
    """
    if metric not in df.columns:
        raise KeyError(f"metrik '{metric}' tidak ada di data: {list(df.columns)}")

    series = df[metric].astype(float)

    if method == "zscore":
        result = detect_zscore(series)
    elif method == "iforest":
        result = detect_iforest(series)
    else:
        raise ValueError(f"metode tidak dikenal: {method!r} (pilih 'zscore' atau 'iforest')")

    out = df.copy()
    out["score"] = result["score"]
    out["is_anomaly"] = result["is_anomaly"]
    n = int(out["is_anomaly"].sum())
    print(f"[detect] metode={method} metrik={metric} → {n} anomali terdeteksi")
    return out


if __name__ == "__main__":
    import fetch_data

    ts = fetch_data.get_timeseries(use_cache=True)
    flagged = detect(ts)
    print(flagged[flagged["is_anomaly"]].tail(10))
