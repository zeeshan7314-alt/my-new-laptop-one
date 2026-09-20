# LaptopIndex — Affiliate Laptop Comparison Engine

## Project Overview
- **Name**: LaptopIndex (webapp)
- **Goal**: Premium data-driven laptop comparison engine (NanoReview / RTINGS style) generated entirely from a spreadsheet database — the spreadsheet IS the CMS.
- **Data**: 101 laptops from "Laptops Recs August 2026.xlsx" — brand, model, segment, display (size/res/refresh/panel/touch), CPU (PassMark), GPU (G3DMark), RAM, storage, dimensions, weight, Amazon rating/reviews/price + affiliate links (tag preserved: `wat344r5-20`).

## URLs
- **Production Domain**: https://laptopindex.info
- **Sandbox Preview**: https://3000-itfuhuub7q0m79qcz0aym-2e77fc33.sandbox.novita.ai
- **Sitemap**: https://laptopindex.info/sitemap.xml
- **Robots.txt**: https://laptopindex.info/robots.txt

## Functional Entry Points
| Route | Description |
|---|---|
| `/` | Home: hero search, category tiles, editor's picks, value/gaming/trending, popular comparisons |
| `/laptops` | Browse + 15 dynamic filters (brand, price, GPU, CPU, RAM, storage, size, res, refresh, panel, touch, weight) + 8 sorts + `?q=` search |
| `/:slug-review` | 101 auto-generated review pages: verdict, pros/cons, who-should-buy, 12 analysis sections, score breakdown, specs, price widget, alternatives, FAQ |
| `/compare` | Comparison hub: any-2 picker + 24 popular pairs |
| `/compare/:a-vs-:b` | Auto comparison: winner summary, weighted spec table, 10 use-case scores, 7 narrative sections, final verdict (canonical slug order, 301 redirect) |
| `/guides` + `/guides/:slug` | 16 buying guides, auto-ranked by score engine (gaming, students, budget, OLED, AI, under-$500/1000/1500, MacBooks…) |
| `/articles` + `/:slug/` | 83 in-depth editorial hardware evaluations, buying guides & category roundups |
| `/wishlist` | localStorage wishlist |
| `/api/laptops`, `/api/laptops/:slug` | JSON API (powers client search suggest) |
| `/sitemap.xml`, `/robots.txt` | Dynamic & static SEO sitemap (235 URLs) with per-article dateModified timestamps |

## Architecture
- **Stack**: Hono + TypeScript + JSX (edge SSR) on Cloudflare Pages, TailwindCSS (CDN), FontAwesome
- **ETL**: `etl/build_data.py` — parses multi-row-header Excel, extracts embedded Amazon hyperlinks, normalizes (fixes typos e.g. NIVIDIA), computes scores/badges → `src/data/laptops.json`. **To update the site: rerun this script with the new spreadsheet, rebuild, redeploy.**
- **Engines** (`src/lib/`):
  - `db.ts` — typed data access layer
  - `engine.ts` — Smart Ranking (10 scores: overall/gaming/office/programming/engineering/creator/student/travel/AI/value with log-normalized benchmarks + review-confidence-weighted ratings), Comparison Engine (weighted point system), Internal-Link Engine (better/cheaper/premium alternatives, same CPU/GPU/brand/budget, similarity distance), Guide Engine, deterministic review-content generator (pros/cons/FAQ/12 sections)
  - `seo.ts` — meta, canonical, OG/Twitter, JSON-LD (Product + AggregateRating + Review, BreadcrumbList, FAQPage, ItemList, WebSite+SearchAction)
- **Pages** (`src/pages/`): home, browse (filters), product, compare, guides
- **Client** (`public/static/app.js`): dark/light theme (no FOUC), sticky compare bar (max 2, localStorage), wishlist, live search suggestions, auto-submit filters

## Badges (auto-assigned)
Editor's Choice · Best Value · Top Gaming Pick · Highly Rated (≥4.4★, ≥500 reviews) · Popular · Lowest Price

## Features Not Yet Implemented
- Cloudflare Pages production deploy (awaiting user's choice of deploy path)
- Price-alert email capture (needs an email API + D1)
- GPU-vs-GPU / CPU-vs-CPU component pages (data supports it)
- Product images (source sheet has none; could add via Amazon PA-API)

## Recommended Next Steps
1. Deploy to Cloudflare Pages, then update `SITE.baseUrl` in `src/lib/seo.ts` to the production domain (canonical/sitemap/JSON-LD depend on it)
2. Automate ETL: connect Google Sheets API + a rebuild webhook for true auto-updates
3. Add component comparison pages (`/gpu/rtx-5060-vs-rtx-5070`)

## Development
```bash
python3 etl/build_data.py "<new spreadsheet.xlsx>"   # refresh data
npm run build
pm2 start ecosystem.config.cjs   # sandbox dev server on :3000
```

## Deployment

### Spaceship Hyperlift Deployment (via GitHub)
1. **Push your code to GitHub**:
   - Ensure `package.json`, `package-lock.json`, and `Dockerfile` are pushed to your repository branch (e.g. `main`).
2. **In Spaceship Dashboard**:
   - Go to **Hyperlift Manager** -> **Create / Connect Application**.
   - Select and authorize your **GitHub** repository.
   - Choose your branch (e.g. `main`).
3. **Build Configuration**:
   - **Build Type**: Dockerfile
   - **Dockerfile Path**: `Dockerfile`
   - **Port**: `8080` (Hyperlift's default, automatically configured in our Dockerfile and server).
4. **Health Check**:
   - Health check endpoint is available at `/health` (returns HTTP 200 `{"status":"ok"}`) and `/healthz`.
5. **Deploy**:
   - Click **Deploy**. Hyperlift pulls the latest code from GitHub, builds the optimized container image, starts the server on port 8080, and provisions your free SSL certificate.
   - Whenever you push updates to GitHub, Hyperlift will automatically trigger a new build and deploy seamlessly with zero downtime.

### Cloudflare Pages
- Can also be deployed to Cloudflare Pages or Cloud Run as needed.

- **Production Domain**: https://laptopindex.info
- **Last Updated**: 2026-08-26
