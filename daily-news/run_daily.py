#!/usr/bin/env python3
"""
Jalankan digest berita harian.

Usage:
    cd daily-news
    pip install -r requirements.txt
    python run_daily.py

Opsional (analisis lebih dalam):
    export OPENAI_API_KEY=sk-...
    python run_daily.py
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from analyze import (
    build_analysis_summary,
    detect_topics,
    find_contradictions,
    optional_llm_analysis,
)
from fetch import Article, fetch_all

ROOT = Path(__file__).resolve().parent
REPORTS = ROOT / "reports"
RAW = ROOT / "raw"
WIB = ZoneInfo("Asia/Jakarta")


def _today_labels() -> tuple[str, str]:
    now = datetime.now(WIB)
    return now.strftime("%Y-%m-%d"), now.strftime("%d %B %Y (WIB)")


def _write_report(
    date_slug: str,
    date_human: str,
    articles: list[Article],
    report_path: Path,
) -> None:
    clusters = detect_topics(articles)
    contradictions = find_contradictions(articles)
    analysis_lines = build_analysis_summary(articles, clusters)
    llm_block = optional_llm_analysis(articles, date_human)

    lines: list[str] = [
        f"# Berita Harian — {date_human}",
        "",
        "> Digest otomatis dari RSS. Folder terpisah dari `rocket-sim/`.",
        "",
        "## Analisis (otomatis)",
        "",
    ]
    lines.extend(f"- {p}" for p in analysis_lines)

    if llm_block:
        lines.extend(["", "## Analisis mendalam (LLM)", "", llm_block])

    lines.extend(["", "## Kontradiksi & framing berbeda", ""])
    if contradictions:
        for c in contradictions:
            lines.extend(
                [
                    f"### {c.topic}",
                    f"- **{c.source_a}:** {c.title_a}",
                    f"- **{c.source_b}:** {c.title_b}",
                    f"- *Catatan:* {c.reason}",
                    "",
                ]
            )
    else:
        lines.append(
            "_Tidak ada pasangan headline yang terdeteksi berbeda framing hari ini. "
            "Tetap bandingkan manual untuk isu politik/ekonomi._"
        )
        lines.append("")

    lines.extend(["", "## Topik ramai", ""])
    for cluster in clusters[:5]:
        lines.append(f"### {cluster.label} ({len(cluster.articles)})")
        for a in cluster.articles[:4]:
            lines.append(f"- [{a.source}] [{a.title}]({a.link})")
        lines.append("")

    lines.extend(["", "## Semua headline", ""])
    current_source = ""
    for a in articles:
        if a.source != current_source:
            current_source = a.source
            lines.append(f"### {current_source}")
        pub = f" — _{a.published[:10]}_" if a.published else ""
        lines.append(f"- [{a.title}]({a.link}){pub}")

    lines.extend(
        [
            "",
            "---",
            f"_Generated at {datetime.now(WIB).isoformat()} · "
            "[daily-news/run_daily.py](run_daily.py)_",
        ]
    )

    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    date_slug, date_human = _today_labels()
    print(f"Mengambil berita untuk {date_human}...")

    articles = fetch_all()
    print(f"  → {len(articles)} artikel")

    RAW.mkdir(parents=True, exist_ok=True)
    raw_path = RAW / f"{date_slug}.json"
    raw_path.write_text(
        json.dumps([a.to_dict() for a in articles], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"  → raw: {raw_path.relative_to(ROOT)}")

    report_path = REPORTS / f"{date_slug}.md"
    _write_report(date_slug, date_human, articles, report_path)
    print(f"  → laporan: {report_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
