# QQ Sozlik

Online dictionary for Karakalpak language users with support for Uzbek -> Karakalpak, Russian -> Karakalpak, and Karakalpak explanatory lookups.

Production URL: https://qqsozlik.com

## Project Overview

QQ Sozlik is a Next.js App Router application focused on multilingual dictionary search and fast word detail pages.

The app includes:

- Real-time search suggestions through API route.
- Exact-match redirect to dedicated word pages.
- Latin/Cyrillic script conversion for Uzbek and Karakalpak.
- Search normalization (case + apostrophe variants).
- Daily-revalidated word pages and sitemap generation.
- Light/dark theme toggle with persisted user preference.

## Language Pairs

- uz-kaa: Uzbek -> Karakalpak
- ru-kaa: Russian -> Karakalpak
- kaa-kaa: Karakalpak -> Karakalpak (explanatory)

## Data Size (Current)

- uz-kaa: 16,109 entries
- ru-kaa: 44,974 entries
- kaa-kaa: 27,840 entries
- Total: 88,923 entries

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 (global styling foundation)
- LRU cache for dictionary loading
- Vercel Analytics

## How It Works

1. Dictionary JSON files are loaded server-side from the data directory.
2. Entries are normalized and cached per pair (LRU + in-flight dedup).
3. Client search submits to /api/search with pair + script + query.
4. API returns:
	- exact match (redirect to detail page), or
	- top suggestion list (prefix first, then partial matches).
5. Word pages render translations/definitions and allow script switching.

## Routes

- / -> redirects to /uz-kaa
- /uz-kaa
- /ru-kaa
- /kaa
- /about
- /[pair]/[script]/[word] (word detail pages)
- /api/search
- /robots.txt (generated)
- /sitemap.xml and chunked sitemap endpoints

Pair examples:

- /uz-kaa/lat/kitap
- /uz-kaa/cyr/kitap
- /ru-kaa/cyr/%D1%81%D0%BB%D0%BE%D0%B2%D0%BE

## SEO and Crawling

- Metadata is defined globally and per route.
- Dynamic sitemaps are chunked to keep each sitemap under URL limits.
- Robots file points to generated sitemap index.
- Canonical URLs are provided for pair pages and word pages.

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Open http://localhost:3000

### Build and Start

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create .env.local in project root (optional for local, recommended for deployment):

```env
NEXT_PUBLIC_SITE_URL=https://qqsozlik.com
```

Used for:

- sitemap URL generation
- robots sitemap links
- canonical/Open Graph URL consistency

## Data Files and Utilities

Main datasets:

- data/uz-kaa.json
- data/ru-kaa.json
- data/kaa-kaa.json

Helper scripts:

- data/fix.py: text cleanup and character normalization for source text.
- data/into_json.py: converts combined text source into JSON entries.

Note: data processing scripts are optional for runtime; app reads prepared JSON files directly.

## Key Source Files

- app/SearchComponent.tsx: client search UI, script handling, and suggestions UI.
- app/api/search/route.ts: search endpoint with exact/prefix/partial logic.
- app/[pair]/[script]/[word]/page.tsx: dynamic word page renderer + metadata.
- lib/dictionary.ts: dictionary loading, normalization, and caching.
- lib/transliterate.ts: Latin/Cyrillic conversion rules.
- lib/normalize.ts: lookup and search normalization helpers.
- app/sitemap.ts and app/robots.ts: crawler metadata.

## Deployment

This project is Vercel-friendly and can be deployed on any Node-compatible host.

Recommended (Vercel):

1. Import repository.
2. Set NEXT_PUBLIC_SITE_URL.
3. Build command: npm run build.
4. Output: Next.js default.

## Notes

- Dictionary files are loaded from local JSON on the server; keep data directory available in deployment artifact.
- Russian source mode is treated as Cyrillic in UI and search handling.
- Search API uses caching headers and returns a small fixed suggestion set for responsiveness.
