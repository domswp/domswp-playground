"""Analisis ringkas + deteksi framing berbeda antar sumber."""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Iterable

from config import OPPOSING_PAIRS, TOPIC_SEEDS
from fetch import Article


@dataclass
class TopicCluster:
    label: str
    articles: list[Article]


@dataclass
class ContradictionHint:
    topic: str
    source_a: str
    title_a: str
    source_b: str
    title_b: str
    reason: str


def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _tokens(text: str) -> set[str]:
    words = {w for w in _normalize(text).split() if len(w) > 3}
    return words


def detect_topics(articles: list[Article]) -> list[TopicCluster]:
    buckets: dict[str, list[Article]] = defaultdict(list)

    for article in articles:
        norm = _normalize(article.title)
        matched = [seed for seed in TOPIC_SEEDS if seed.strip() in norm]
        if matched:
            label = matched[0].strip().title()
        else:
            # Fallback: kata terpanjang di judul sebagai label kasar
            words = [w for w in norm.split() if len(w) > 5]
            label = words[0].title() if words else "Lainnya"
        buckets[label].append(article)

    clusters = [
        TopicCluster(label=k, articles=v)
        for k, v in sorted(buckets.items(), key=lambda x: -len(x[1]))
    ]
    return clusters[:8]


def _opposing_signals(title_a: str, title_b: str) -> str | None:
    a, b = _normalize(title_a), _normalize(title_b)
    for left, right in OPPOSING_PAIRS:
        if (left in a and right in b) or (right in a and left in b):
            return f"Framing berbeda: '{left}' vs '{right}'"
    return None


def find_contradictions(articles: list[Article]) -> list[ContradictionHint]:
    """Cari judul dari sumber berbeda yang membahas topik serupa tapi framing berbeda."""
    hints: list[ContradictionHint] = []
    seen: set[tuple[str, str, str]] = set()

    for i, a in enumerate(articles):
        ta = _tokens(a.title)
        for b in articles[i + 1 :]:
            if a.source == b.source:
                continue
            overlap = ta & _tokens(b.title)
            if len(overlap) < 2:
                continue
            reason = _opposing_signals(a.title, b.title)
            if not reason:
                # Topik sama, framing belum jelas beda — tetap catat sebagai perlu dibaca
                reason = (
                    f"Topik overlap ({', '.join(sorted(overlap)[:4])}) — "
                    "baca kedua sumber untuk nuansa"
                )
            topic = sorted(overlap, key=len, reverse=True)[0]
            key = (topic, a.source, b.source)
            if key in seen:
                continue
            seen.add(key)
            hints.append(
                ContradictionHint(
                    topic=topic.title(),
                    source_a=a.source,
                    title_a=a.title,
                    source_b=b.source,
                    title_b=b.title,
                    reason=reason,
                )
            )
            if len(hints) >= 6:
                return hints
    return hints


def build_analysis_summary(
    articles: list[Article], clusters: list[TopicCluster]
) -> list[str]:
    """Paragraf analisis otomatis (tanpa LLM) — cukup untuk mobile skim."""
    by_source: dict[str, int] = defaultdict(int)
    for a in articles:
        by_source[a.source] += 1

    lines: list[str] = []
    lines.append(
        f"Hari ini terkumpul **{len(articles)}** headline dari "
        f"**{len(by_source)}** sumber: "
        + ", ".join(f"{k} ({v})" for k, v in sorted(by_source.items()))
        + "."
    )

    if clusters:
        top = clusters[0]
        lines.append(
            f"Topik paling ramai di radar: **{top.label}** "
            f"({len(top.articles)} berita terkait). "
            "Worth reading kalau kamu mau satu tema dulu sebelum scroll sisanya."
        )

    intl = [a for a in articles if a.lang == "en"]
    if intl:
        lines.append(
            f"Sisi teknologi internasional (HN): {len(intl)} item — "
            "biasanya beda tempo dari berita nasional; bagus untuk balance perspektif."
        )

    lines.append(
        "Catatan metodologi: ini agregasi RSS, bukan fact-check. "
        "Bagian kontradiksi di bawah menandai **kemungkin** framing berbeda; "
        "selalu buka link asli sebelum simpulan."
    )
    return lines


def optional_llm_analysis(articles: list[Article], date_label: str) -> str | None:
    """Analisis mendalam via OpenAI jika OPENAI_API_KEY diset (opsional)."""
    import os

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None

    try:
        from openai import OpenAI
    except ImportError:
        return None

    headlines = "\n".join(
        f"- [{a.source}] {a.title} ({a.link})" for a in articles[:35]
    )
    client = OpenAI(api_key=api_key)
    prompt = f"""Kamu adalah analis berita untuk pembaca Indonesia (Domas).
Tanggal laporan: {date_label}

Berikut headline hari ini:
{headlines}

Tulis dalam Bahasa Indonesia, format markdown:
1. **Ringkasan hari ini** (3-5 kalimat)
2. **Analisis** — pola tema, siapa yang untung/rugi, apa yang perlu diwaspadai
3. **Kontradiksi & framing berbeda** — bandingkan sumber yang mungkin melaporkan sudut berbeda (jika tidak ada, katakan jujur)
4. **Yang perlu ditindaklanjuti** — 2-3 poin untuk pembaca hobby tech

Jangan mengarang fakta di luar headline. Singkat, mobile-friendly."""

    response = client.chat.completions.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=1200,
    )
    return response.choices[0].message.content
