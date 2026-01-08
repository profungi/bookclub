import csv, requests

IN_CSV = "bookclub_gateway_rss_all.csv"
OUT_OK = "bookclub_gateway_rss_verified.csv"

def is_rss(text: str) -> bool:
    t = text.lstrip().lower()
    return t.startswith("<?xml") or t.startswith("<rss") or t.startswith("<feed")

ok_rows = []
with open(IN_CSV, newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        url = r["bookclub_rss_url"]
        try:
            resp = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200 and is_rss(resp.text) and ("<item" in resp.text.lower() or "<entry" in resp.text.lower()):
                ok_rows.append(r)
        except Exception:
            pass

with open(OUT_OK, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["library_name","slug","bookclub_rss_url"])
    w.writeheader()
    w.writerows(ok_rows)

print("verified:", len(ok_rows))