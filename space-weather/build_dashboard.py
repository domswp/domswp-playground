"""
build_dashboard.py — render time-series + anomali menjadi satu file
index.html yang SELF-CONTAINED (plotly.js ditanam inline, tanpa CDN).

Hasilnya bisa dibuka offline dan di-serve apa adanya oleh GitHub Pages.
Grafik:
  - Garis biru   : jumlah solar flare per hari (metrik utama)
  - Titik merah  : hari yang terdeteksi anomali
  - Garis oranye : indeks Kp maksimum (sumbu-y kanan, konteks badai geomagnetik)
"""

from __future__ import annotations

import datetime as dt

import pandas as pd
import plotly.graph_objects as go

import config

# Warna senada tema "Lab Domas" (latar gelap kebiruan).
_BG = "#050810"
_CARD = "#0c1220"
_TEXT = "#e8eefc"
_MUTED = "#8b9bb8"
_FLARE = "#5eb3ff"  # biru — garis flare
_ANOMALY = "#ff5e7e"  # merah/pink — titik anomali
_KP = "#f5a623"  # oranye — konteks Kp


def build(df: pd.DataFrame, method: str, out_path=None) -> str:
    """Bangun dashboard HTML dari DataFrame yang sudah ber-kolom is_anomaly.

    Mengembalikan path file HTML yang ditulis.
    """
    out_path = out_path or config.OUTPUT_HTML
    out_path.parent.mkdir(parents=True, exist_ok=True)

    anomalies = df[df["is_anomaly"]]
    last_date = df.index.max().date().isoformat() if len(df) else "—"
    generated = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    method_label = {
        "zscore": "Rolling mean + z-score",
        "iforest": "Isolation Forest (ML)",
    }.get(method, method)

    fig = go.Figure()

    # Garis utama: jumlah flare harian.
    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["flare_count"],
            mode="lines",
            name="Solar flare / hari",
            line=dict(color=_FLARE, width=1.6),
            hovertemplate="%{x|%d %b %Y}<br>Flare: %{y}<extra></extra>",
        )
    )

    # Titik anomali di atas garis (warna beda, lebih menonjol).
    fig.add_trace(
        go.Scatter(
            x=anomalies.index,
            y=anomalies["flare_count"],
            mode="markers",
            name="Anomali",
            marker=dict(color=_ANOMALY, size=9, symbol="circle", line=dict(color="#fff", width=1)),
            hovertemplate="%{x|%d %b %Y}<br>Flare: %{y}<br><b>ANOMALI</b><extra></extra>",
        )
    )

    # Konteks: indeks Kp maksimum di sumbu-y kanan (badai geomagnetik).
    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["kp_max"],
            mode="lines",
            name="Kp maks (badai geomagnetik)",
            line=dict(color=_KP, width=1, dash="dot"),
            yaxis="y2",
            opacity=0.65,
            hovertemplate="%{x|%d %b %Y}<br>Kp maks: %{y}<extra></extra>",
        )
    )

    fig.update_layout(
        title=dict(
            text=(
                "Space Weather Monitor"
                f"<br><sub style='color:{_MUTED}'>Deteksi anomali aktivitas Matahari · "
                f"metode: {method_label} · data s/d {last_date} · "
                f"di-update {generated}</sub>"
            ),
            font=dict(color=_TEXT, size=22),
        ),
        paper_bgcolor=_BG,
        plot_bgcolor=_CARD,
        font=dict(color=_TEXT, family="system-ui, -apple-system, Segoe UI, sans-serif"),
        xaxis=dict(title="Tanggal", gridcolor="rgba(120,160,255,0.12)", showgrid=True),
        yaxis=dict(
            title="Jumlah solar flare / hari",
            gridcolor="rgba(120,160,255,0.12)",
            showgrid=True,
        ),
        yaxis2=dict(
            title="Kp maks",
            overlaying="y",
            side="right",
            showgrid=False,
            range=[0, 9],  # Kp index skala 0–9
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="left",
            x=0,
            bgcolor="rgba(0,0,0,0)",
        ),
        hovermode="x unified",
        margin=dict(l=60, r=60, t=110, b=60),
    )

    # Footer info sebagai anotasi di bawah grafik.
    fig.add_annotation(
        text=(
            "Sumber: NASA DONKI (FLR + GST) · perkiraan untuk edukasi, bukan peringatan resmi · "
            "Lab Domas"
        ),
        xref="paper",
        yref="paper",
        x=0,
        y=-0.18,
        showarrow=False,
        font=dict(color=_MUTED, size=11),
        align="left",
    )

    # include_plotlyjs=True  → tanam seluruh plotly.js INLINE (self-contained).
    # full_html=True         → hasilkan dokumen HTML lengkap (<html>..</html>).
    fig.write_html(
        str(out_path),
        include_plotlyjs=True,
        full_html=True,
        config={"displayModeBar": True, "responsive": True},
    )
    print(f"[dashboard] ditulis → {out_path}  ({len(anomalies)} anomali ditandai)")
    return str(out_path)


if __name__ == "__main__":
    import detect
    import fetch_data

    ts = fetch_data.get_timeseries(use_cache=True)
    flagged = detect.detect(ts)
    build(flagged, method=config.DEFAULT_METHOD)
