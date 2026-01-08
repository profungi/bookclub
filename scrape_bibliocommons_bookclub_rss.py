#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrape BiblioCommons libraries for Book Club *event series* and discover a working RSS feed URL for each series.

Input:  CSV with columns: library_name, library_base_url
Output: CSV with columns: library_name, book_club_name, book_club_url, rss_url, notes

Double-check rules (built in):
- RSS/Atom URL must return HTTP 200
- content-type contains "xml" OR body starts with <rss / <feed / <?xml
- feed contains at least one <item> or <entry>

Run:
  python scrape_bibliocommons_bookclub_rss.py book_club_rss_table_template.csv output_bookclubs.csv
"""

from __future__ import annotations
import csv
import re
import sys
import time
import urllib.parse
import urllib.request
from typing import Tuple, Dict, List, Optional

USER_AGENT = "Mozilla/5.0 (compatible; BookClubRSSBot/1.0)"
TIMEOUT = 25
SLEEP_SEC = 0.25

BOOK_CLUB_LABEL_RE = re.compile(r"\b(book\s*club|book\s*discussion|reading\s*group)\b", re.IGNORECASE)

def fetch(url: str) -> Tuple[int, Dict[str, str], str]:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        status = resp.status
        headers = {k.lower(): v for k, v in resp.headers.items()}
        body = resp.read().decode("utf-8", errors="replace")
    return status, headers, body

def join(base: str, path: str) -> str:
    return urllib.parse.urljoin(base if base.endswith("/") else base + "/", path.lstrip("/"))

def html_unescape(s: str) -> str:
    return (s.replace("&amp;","&").replace("&lt;","<").replace("&gt;",">")
             .replace("&quot;",'"').replace("&#39;","'"))

def extract_bookclub_type_ids(html: str) -> List[str]:
    ids: List[str] = []

    # JSON-like: {"id":"<24hex>","name":"Book Club"}
    for m in re.finditer(r'"id"\s*:\s*"([0-9a-f]{24})"\s*,\s*"name"\s*:\s*"([^"]+)"', html, re.IGNORECASE):
        _id, name = m.group(1), m.group(2)
        if BOOK_CLUB_LABEL_RE.search(name):
            ids.append(_id)

    # name then id nearby
    for m in re.finditer(r'("name"\s*:\s*"[^"]*(?:book\s*club|book\s*discussion|reading\s*group)[^"]*")(.{0,200}?)"id"\s*:\s*"([0-9a-f]{24})"', html, re.IGNORECASE | re.DOTALL):
        ids.append(m.group(3))

    # data attributes
    for m in re.finditer(r'data-(?:value|id|filter-id)="([0-9a-f]{24})"[^>]{0,250}(?:book\s*club|book\s*discussion|reading\s*group)', html, re.IGNORECASE):
        ids.append(m.group(1))

    # dedupe preserve order
    seen=set(); out=[]
    for x in ids:
        if x not in seen:
            seen.add(x); out.append(x)
    return out

def extract_series_links(html: str, base: str) -> List[str]:
    links: List[str] = []

    for m in re.finditer(r'href="([^"]*?\bseries=([0-9a-f]{24})[^"]*)"', html, re.IGNORECASE):
        links.append(join(base, m.group(1)))

    for m in re.finditer(r'(/v2/events\?[^"\s<>]*\bseries=([0-9a-f]{24})[^"\s<>]*)', html, re.IGNORECASE):
        links.append(join(base, m.group(1)))

    seen=set(); out=[]
    for u in links:
        if u not in seen:
            seen.add(u); out.append(u)
    return out

def best_effort_series_title(series_url: str) -> Optional[str]:
    try:
        status, headers, body = fetch(series_url)
        if status != 200:
            return None
        m = re.search(r'Event series:\s*([^<\n\r]+)', body, re.IGNORECASE)
        if m:
            return html_unescape(m.group(1)).strip()
        m2 = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.IGNORECASE | re.DOTALL)
        if m2:
            return re.sub(r'<[^>]+>', '', m2.group(1)).strip()
    except Exception:
        return None
    return None

def rss_candidates(base: str, series_id: str, type_ids: List[str]) -> List[str]:
    cands = []
    cands.append(join(base, "/events/rss/all"))  # fallback: all events

    # series-filter attempts (not all libraries support these; we'll validate)
    cands.append(join(base, f"/events/rss/all?series={series_id}"))
    cands.append(join(base, f"/events/rss?series={series_id}"))
    cands.append(join(base, f"/events/rss/series/{series_id}"))

    if type_ids:
        joined = ",".join(type_ids)
        cands.append(join(base, f"/events/rss/all?types={urllib.parse.quote(joined)}"))
        cands.append(join(base, f"/events/rss?types={urllib.parse.quote(joined)}"))

    seen=set(); out=[]
    for c in cands:
        if c not in seen:
            seen.add(c); out.append(c)
    return out

def validate_feed(url: str) -> Tuple[bool, str]:
    try:
        status, headers, body = fetch(url)
    except Exception as e:
        return False, f"fetch error: {e}"

    ctype = headers.get("content-type","").lower()
    body_l = body.lstrip().lower()

    if status != 200:
        return False, f"HTTP {status}"
    if ("xml" not in ctype) and not (body_l.startswith("<rss") or body_l.startswith("<?xml") or body_l.startswith("<feed")):
        return False, f"not xml (content-type={ctype})"
    if ("<item" not in body_l) and ("<entry" not in body_l):
        return False, "no <item>/<entry>"
    return True, "ok"

def run(input_csv: str, output_csv: str) -> None:
    libs = []
    with open(input_csv, "r", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            base = (r.get("library_base_url") or "").strip()
            if not base:
                continue
            libs.append((r.get("library_name","").strip(), base))

    out_rows = []
    for idx, (lib_name, base) in enumerate(libs, 1):
        lib_name = lib_name or "(unknown)"
        try:
            events_url = join(base, "/v2/events")
            s, h, html = fetch(events_url)
            time.sleep(SLEEP_SEC)

            if s != 200:
                out_rows.append({"library_name":lib_name, "book_club_name":"", "book_club_url":"", "rss_url":"", "notes":f"/v2/events HTTP {s}"})
                continue

            type_ids = extract_bookclub_type_ids(html)
            if not type_ids:
                out_rows.append({"library_name":lib_name, "book_club_name":"", "book_club_url":"", "rss_url":"", "notes":"no book-club-like type id found"})
                continue

            filtered_url = join(base, "/v2/events?types=" + ",".join(type_ids))
            s2, h2, html2 = fetch(filtered_url)
            time.sleep(SLEEP_SEC)

            if s2 != 200:
                out_rows.append({"library_name":lib_name, "book_club_name":"", "book_club_url":"", "rss_url":"", "notes":f"types page HTTP {s2}"})
                continue

            series_links = extract_series_links(html2, base)
            if not series_links:
                out_rows.append({"library_name":lib_name, "book_club_name":"", "book_club_url":"", "rss_url":"", "notes":"no series links found (maybe single events)"})
                continue

            for series_url in series_links:
                m = re.search(r'\bseries=([0-9a-f]{24})', series_url, re.IGNORECASE)
                if not m:
                    continue
                series_id = m.group(1)
                title = best_effort_series_title(series_url) or f"(series {series_id})"

                rss_url = ""
                note = ""
                for cand in rss_candidates(base, series_id, type_ids):
                    ok, msg = validate_feed(cand)
                    time.sleep(SLEEP_SEC)
                    if ok:
                        rss_url = cand
                        note = "validated"
                        break
                    note = msg

                out_rows.append({"library_name":lib_name, "book_club_name":title, "book_club_url":series_url, "rss_url":rss_url, "notes":note})

        except Exception as e:
            out_rows.append({"library_name":lib_name, "book_club_name":"", "book_club_url":"", "rss_url":"", "notes":f"error: {e}"})

        if idx % 25 == 0:
            print(f"Processed {idx}/{len(libs)} libraries...", file=sys.stderr)

    with open(output_csv, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["library_name","book_club_name","book_club_url","rss_url","notes"])
        w.writeheader()
        w.writerows(out_rows)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scrape_bibliocommons_bookclub_rss.py input.csv output.csv", file=sys.stderr)
        sys.exit(2)
    run(sys.argv[1], sys.argv[2])
