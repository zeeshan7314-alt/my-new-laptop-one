#!/usr/bin/env python3
"""
Image Pipeline: Amazon product pages -> WebP thumbnails
Fetches the main product image for each laptop's ASIN, converts to WebP
(400px card size) and writes public/static/img/laptops/{slug}.webp
plus an images.json manifest merged into the data build.
Rerun-safe: skips slugs that already have a .webp file.
"""
import json, re, io, os, time, random, sys
import urllib.request
from PIL import Image

DATA = "/home/user/webapp/src/data/laptops.json"
OUTDIR = "/home/user/webapp/public/static/img/laptops"
MANIFEST = "/home/user/webapp/src/data/images.json"
os.makedirs(OUTDIR, exist_ok=True)

UAS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0",
]

def fetch(url, binary=False, timeout=20):
    req = urllib.request.Request(url, headers={
        "User-Agent": random.choice(UAS),
        "Accept": "*/*" if binary else "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read() if binary else r.read().decode("utf-8", "ignore")

IMG_PATTERNS = [
    r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+?)"',
    r'"large":"(https://m\.media-amazon\.com/images/I/[^"]+?)"',
    r'<meta property="og:image" content="(https://m\.media-amazon\.com/images/I/[^"]+?)"',
    r'id="landingImage"[^>]+src="(https://m\.media-amazon\.com/images/I/[^"]+?)"',
    r'"mainUrl":"(https://m\.media-amazon\.com/images/I/[^"]+?)"',
]

def find_image(html):
    for pat in IMG_PATTERNS:
        m = re.search(pat, html)
        if m:
            return m.group(1)
    return None

def normalize_size(url, px=500):
    # force a reasonable size variant: .../I/<id>._AC_SL500_.jpg
    m = re.match(r'(https://m\.media-amazon\.com/images/I/[A-Za-z0-9+%.-]+?)\.(?:[^/]*\.)?(jpg|png|jpeg)', url)
    if m:
        return f"{m.group(1)}._AC_SL{px}_.jpg"
    return url

db = json.load(open(DATA))
laptops = db["laptops"]
manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}

ok = fail = skip = 0
failed_slugs = []
for l in laptops:
    slug = l["slug"]
    out = f"{OUTDIR}/{slug}.webp"
    if os.path.exists(out) and os.path.getsize(out) > 2000:
        manifest[slug] = f"/static/img/laptops/{slug}.webp"
        skip += 1
        continue
    m = re.search(r'/dp/([A-Z0-9]{10})', l["amazon"]["url"] or "")
    if not m:
        fail += 1; failed_slugs.append(slug); continue
    asin = m.group(1)
    try:
        html = fetch(f"https://www.amazon.com/dp/{asin}")
        img_url = find_image(html)
        if not img_url:
            raise ValueError("no image found (possible captcha)")
        raw = fetch(normalize_size(img_url), binary=True)
        im = Image.open(io.BytesIO(raw)).convert("RGB")
        im.thumbnail((400, 400), Image.LANCZOS)
        # pad to square on white for consistent cards
        sq = Image.new("RGB", (400, 400), (255, 255, 255))
        sq.paste(im, ((400 - im.width) // 2, (400 - im.height) // 2))
        sq.save(out, "WEBP", quality=82, method=6)
        manifest[slug] = f"/static/img/laptops/{slug}.webp"
        ok += 1
        print(f"[{ok+fail+skip}/{len(laptops)}] OK {slug} ({os.path.getsize(out)//1024}KB)")
    except Exception as e:
        fail += 1
        failed_slugs.append(slug)
        print(f"[{ok+fail+skip}/{len(laptops)}] FAIL {slug}: {e}")
    time.sleep(random.uniform(0.8, 1.8))

json.dump(manifest, open(MANIFEST, "w"), indent=0)
print(f"\nDone: {ok} fetched, {skip} cached, {fail} failed")
if failed_slugs:
    print("Failed:", failed_slugs)
