"""Ambil berita dari feed RSS."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from html import unescape
from typing import Any

import feedparser
import requests
from dateutil import parser as date_parser

from config import FEEDS, MAX_PER_FEED, USER_AGENT


@dataclass
class Article:
    title: str
    link: str
    source: str
    lang: str
    published: str | None
    summary: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _clean_html(text: str) -> str:
    if not text:
        return ""
    text = unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:500]


def _parse_date(entry: dict[str, Any]) -> str | None:
    for key in ("published", "updated", "created"):
        raw = entry.get(key)
        if not raw:
            continue
        try:
            dt = date_parser.parse(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).isoformat()
        except (ValueError, TypeError):
            continue
    return None


def fetch_feed(name: str, url: str, lang: str) -> list[Article]:
    headers = {"User-Agent": USER_AGENT}
    response = requests.get(url, headers=headers, timeout=25)
    response.raise_for_status()
    parsed = feedparser.parse(response.content)
    articles: list[Article] = []

    for entry in parsed.entries[:MAX_PER_FEED]:
        title = _clean_html(entry.get("title", ""))
        link = entry.get("link", "").strip()
        if not title or not link:
            continue
        summary = _clean_html(
            entry.get("summary") or entry.get("description") or ""
        )
        articles.append(
            Article(
                title=title,
                link=link,
                source=name,
                lang=lang,
                published=_parse_date(entry),
                summary=summary,
            )
        )
    return articles


def fetch_all() -> list[Article]:
    all_articles: list[Article] = []
    errors: list[str] = []

    for feed in FEEDS:
        try:
            batch = fetch_feed(feed["name"], feed["url"], feed["lang"])
            all_articles.extend(batch)
        except Exception as exc:  # noqa: BLE001 — log per feed, lanjut yang lain
            errors.append(f"{feed['name']}: {exc}")

    if errors and not all_articles:
        raise RuntimeError("Semua feed gagal:\n" + "\n".join(errors))

    # Terbaru dulu (yang punya tanggal)
    def sort_key(a: Article) -> datetime:
        if not a.published:
            return datetime.min.replace(tzinfo=timezone.utc)
        try:
            return date_parser.parse(a.published)
        except (ValueError, TypeError):
            return datetime.min.replace(tzinfo=timezone.utc)

    all_articles.sort(key=sort_key, reverse=True)
    return all_articles
