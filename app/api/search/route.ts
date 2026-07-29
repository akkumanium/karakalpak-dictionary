import { type NextRequest, NextResponse } from "next/server";
import { getDictionaryList } from "../../../lib/dictionary";
import { toLatinFromCyrillic } from "../../../lib/transliterate";
import { type Script, type LangCode } from "../../../lib/languages";
import { normalizeSearchCase } from "../../../lib/normalize";

// Normalizes the user's query to match the pre-computed sourceNormalized format.
// Must stay in sync with normalizeSource() in lib/dictionary.ts.
function normalizeQuery(q: string, script: Script, isRussian: boolean, from: LangCode): string {
  const apostropheNorm = q.replace(/[\u0027\u0060\u2019\u2018\u02BC\u02BB\u201B\uFF07]/g, "'");
  // For non-Russian Cyrillic input, transliterate to Latin first (entries are stored in Latin)
  const latin = (!isRussian && script === "cyr")
    ? toLatinFromCyrillic(apostropheNorm, from)
    : apostropheNorm;
  return normalizeSearchCase(latin, from);
}

const LIMIT = 5;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from   = (searchParams.get("from")   ?? "uz")  as LangCode;
  const to     = (searchParams.get("to")     ?? "kaa") as Exclude<LangCode, "ru">;
  const q      = (searchParams.get("q")      ?? "").trim();
  const script = (searchParams.get("script") ?? "lat") as Script;

  if (q.length < 1) {
    return NextResponse.json({ exact: null, results: [] }, {
      headers: { "Cache-Control": "public, max-age=0" },
    });
  }

  const isRussian = from === "ru";
  const list = await getDictionaryList(from, to);
  if (!list) return NextResponse.json({ exact: null, results: [] }, { status: 404 });

  const search = normalizeQuery(q, script, isRussian, from);

  const prefixMatches:  typeof list = [];
  const partialMatches: typeof list = [];
  let exactMatch: typeof list[number] | null = null;

  for (const entry of list) {
    const norm = entry.sourceNormalized;
    if (!norm.includes(search)) continue;

    if (norm === search) {
      exactMatch = entry;
      continue;
    }

    if (norm.startsWith(search)) {
      if (prefixMatches.length < LIMIT) prefixMatches.push(entry);
    } else if (partialMatches.length < LIMIT) {
      partialMatches.push(entry);
    }
  }

  prefixMatches.sort((a, b) => a.sourceNormalized.localeCompare(b.sourceNormalized));

  const results = [...prefixMatches, ...partialMatches].slice(0, LIMIT);

  return NextResponse.json({ exact: exactMatch, results }, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

