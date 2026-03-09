import { type NextRequest, NextResponse } from "next/server";
import { getDictionaryList } from "../../../lib/dictionary";
import { toLatinFromCyrillic } from "../../../lib/transliterate";
import { type Script, type LangCode } from "../../../lib/languages";

// Normalizes the user's query to match the pre-computed sourceNormalized format.
// Must stay in sync with normalizeSource() in lib/dictionary.ts.
function normalizeQuery(q: string, script: Script, isRussian: boolean, from: LangCode): string {
  const apostropheNorm = q.replace(/[\u0027\u0060\u2019\u2018\u02BC\u02BB\u201B\uFF07]/g, "'");
  // For non-Russian Cyrillic input, transliterate to Latin first (entries are stored in Latin)
  const latin = (!isRussian && script === "cyr")
    ? toLatinFromCyrillic(apostropheNorm, from)
    : apostropheNorm;
  return latin.replace(/ё/gi, "е").toUpperCase();
}

const LIMIT = 15;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from   = (searchParams.get("from")   ?? "uz")  as LangCode;
  const to     = (searchParams.get("to")     ?? "kaa") as Exclude<LangCode, "ru">;
  const q      = (searchParams.get("q")      ?? "").trim();
  const script = (searchParams.get("script") ?? "lat") as Script;

  if (q.length < 1) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=0" },
    });
  }

  const isRussian = from === "ru";
  const list = await getDictionaryList(from, to);
  if (!list) return NextResponse.json([], { status: 404 });

  // Normalize the query once — never again inside the loop.
  const search = normalizeQuery(q, script, isRussian, from);

  const prefixMatches:  typeof list = [];
  const partialMatches: typeof list = [];

  for (const entry of list) {
    // sourceNormalized was computed at load time, so this is two plain string ops.
    const norm = entry.sourceNormalized;
    if (!norm.includes(search)) continue;

    if (norm.startsWith(search)) {
      prefixMatches.push(entry);
      // Once we have LIMIT prefix matches we can't do better — stop entirely.
      if (prefixMatches.length >= LIMIT) break;
    } else if (partialMatches.length < LIMIT) {
      partialMatches.push(entry);
    }
  }

  // Prefix bucket: sort alphabetically by normalized form for stable, predictable ordering.
  // Partial bucket: already naturally in file order; sort only if not yet full.
  prefixMatches.sort((a, b) => a.sourceNormalized.localeCompare(b.sourceNormalized));

  const results = [...prefixMatches, ...partialMatches].slice(0, LIMIT);

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}