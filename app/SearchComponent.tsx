"use client";

import { useState, useEffect, useRef, useTransition, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { type DictionaryEntry } from "../lib/dictionary";
import { DIRECTIONS, LANG_NAMES, type Script, type LangCode } from "../lib/languages";
import { convertScript } from "../lib/transliterate";
import { toPairSegment } from "../lib/routes";
import { useTheme } from "../context/ThemeContext";

interface Props {
  availablePairs: string[];
  from: LangCode;
  to: Exclude<LangCode, "ru">;
}

export default function SearchComponent({ availablePairs, from, to }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggle } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const fromParam = from;
  const toParam   = to;

  const isRussian = fromParam === "ru";
  const script    = isRussian
    ? "cyr"
    : ((searchParams.get("script") as Script) ?? "lat");

  const [query,         setQuery        ] = useState("");
  const [filteredWords, setFilteredWords] = useState<DictionaryEntry[]>([]);
  const [mounted,       setMounted      ] = useState(false);
  const [hasSearched,   setHasSearched  ] = useState(false);
  const [isPending,     startTransition ] = useTransition();
  const [showNoResults, setShowNoResults] = useState(false);
  const noResultsTimerRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (noResultsTimerRef.current !== null) {
      window.clearTimeout(noResultsTimerRef.current);
      noResultsTimerRef.current = null;
    }

    const shouldShow =
      hasSearched &&
      query.trim().length > 0 &&
      filteredWords.length === 0;

    if (!shouldShow) {
      setShowNoResults(false);
      return;
    }

    noResultsTimerRef.current = window.setTimeout(() => {
      setShowNoResults(true);
    }, 600);

    return () => {
      if (noResultsTimerRef.current !== null) {
        window.clearTimeout(noResultsTimerRef.current);
        noResultsTimerRef.current = null;
      }
    };
  }, [hasSearched, query, filteredWords.length]);

  const isPairValid = availablePairs.includes(`${fromParam}-${toParam}`);

  function buildUrl(overrides: { from?: string; to?: string; script?: string }) {
    const f = overrides.from   ?? fromParam;
    const t = overrides.to     ?? toParam;
    const s = overrides.script ?? script;
    const basePath = `/${toPairSegment(f, t)}`;
    if (f === "ru") return basePath;
    return `${basePath}?script=${s}`;
  }

  // ── Server search ──────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);
  const searchIdRef = useRef(0);

  type SearchResponse = { exact: DictionaryEntry | null; results: DictionaryEntry[] };

  const runSearch = useCallback(
    async (q: string, currentScript: Script) => {
      const trimmed = q.trim();
      if (!isPairValid || trimmed.length < 1) {
        setFilteredWords([]);
        return;
      }

      const searchId = ++searchIdRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          from:   fromParam,
          to:     toParam,
          q:      trimmed,
          script: currentScript,
        });
        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        if (!res.ok) return;
        const data: SearchResponse = await res.json();
        if (searchIdRef.current !== searchId) return;

        if (data.exact) {
          const wordHref = `/${toPairSegment(fromParam, toParam)}/${currentScript}/${encodeURIComponent(data.exact.source)}`;
          setFilteredWords([]);
          startTransition(() => {
            router.push(wordHref);
          });
          return;
        }

        setFilteredWords(Array.isArray(data.results) ? data.results : []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err);
      }
    },
    [fromParam, toParam, isPairValid, router, startTransition],
  );


  // ── Query / script change handler ──────────────────────────────────────────
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setHasSearched(false);
    searchIdRef.current += 1;
    abortRef.current?.abort();
    setFilteredWords([]);
    if (isRussian) return;

    const hasCyrillic = /[\u0400-\u04FF]/.test(val);
    let detectedScript: Script = script;
    if (val.length > 0) detectedScript = hasCyrillic ? "cyr" : "lat";

    if (detectedScript !== script) {
      startTransition(() => {
        router.replace(buildUrl({ script: detectedScript }), { scroll: false });
      });
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setFilteredWords([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const detectedScript: Script = isRussian
      ? "cyr"
      : (/[\u0400-\u04FF]/.test(trimmed) ? "cyr" : "lat");

    if (!isRussian && detectedScript !== script) {
      startTransition(() => {
        router.replace(buildUrl({ script: detectedScript }), { scroll: false });
      });
    }

    runSearch(trimmed, detectedScript);
  };

  return (
    <main style={{ maxWidth: "600px", margin: "10vh auto", fontFamily: "system-ui, sans-serif", padding: "0 20px" }}>

      {/* ── Loading overlay ── */}
      {isPending && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(2px)",
        }}>
          <div style={{
            backgroundColor: "var(--bg)",
            color: "var(--fg)",
            padding: "20px 36px",
            borderRadius: "12px",
            fontSize: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <span style={{ fontSize: "20px", animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
            Sózlik júklenip atır...
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Dark mode toggle ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        <button
          onClick={toggle}
          suppressHydrationWarning
          style={{
            background: "none", border: "1px solid var(--border)",
            borderRadius: "6px", padding: "6px 12px", cursor: "pointer",
            fontSize: "13px", color: "var(--fg)",
          }}
        >
          {mounted ? (theme === "light" ? "🌙 Dark" : "☀️ Light") : "🌙 Dark"}
        </button>
      </div>

      <h1 style={{ textAlign: "center", fontWeight: "400", color: "var(--fg)" }}>
        {LANG_NAMES[fromParam]["lat"]} – {LANG_NAMES[toParam]["lat"]} Sózlik
      </h1>

      {/* ── Settings bar ── */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "20px 0", flexWrap: "wrap" }}>
        <select
          value={`${fromParam}-${toParam}`}
          onChange={(e) => {
            const [f, t] = e.target.value.split("-");
            startTransition(() => { router.push(buildUrl({ from: f, to: t })); });
          }}
          style={{
            padding: "8px 12px", borderRadius: "6px",
            border: "1px solid var(--border)", fontSize: "14px",
            backgroundColor: "var(--bg)", color: "var(--fg)",
          }}
        >
          {DIRECTIONS.map((d) => (
            <option key={`${d.from}-${d.to}`} value={`${d.from}-${d.to}`}>{d.label}</option>
          ))}
        </select>

        {!isRussian && (
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
            {(["lat", "cyr"] as Script[]).map((s) => (
              <Link
                key={s}
                href={buildUrl({ script: s })}
                style={{
                  padding: "8px 16px", fontSize: "14px", textDecoration: "none",
                  backgroundColor: script === s ? "var(--bg-active)" : "var(--bg-item)",
                  color: script === s ? "var(--fg-active)" : "var(--fg)",
                  fontWeight: script === s ? "600" : "400",
                }}
              >
                {s === "lat" ? "Latin" : "Кирил"}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* -- Special character buttons (by language/script) -- */}
      {(() => {
        if (isRussian) return null;

        const specialChars =
          fromParam === "uz" && script === "cyr"
            ? ["\u04bb", "\u049b", "\u0493", "\u045e"]
            : fromParam === "kaa" && script === "lat"
              ? ["\u00e1", "\u0261\u0301", "\u0131", "\u0144", "\u00f3", "\u00fa"]
              : fromParam === "kaa" && script === "cyr"
                ? ["\u04d9", "\u04a3", "\u0493", "\u049b", "\u04af", "\u04e9", "\u045e", "\u04b3"]
                : [];

        if (specialChars.length === 0) return null;
        return (
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px", justifyContent: "center" }}>
            {specialChars.map((char) => (
              <button
                key={char}
                onClick={() => { handleQueryChange(query + char); inputRef.current?.focus(); }}
                style={{
                  padding: "8px 15px", fontSize: "18px", borderRadius: "6px",
                  border: "1px solid var(--border)", backgroundColor: "var(--bg-item)",
                  color: "var(--fg)", cursor: "pointer", fontWeight: "bold",
                }}
              >
                {char}
              </button>
            ))}
          </div>
        );
      })()}

      {/* ── Search ── */}
      <div style={{ position: "relative" }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Sóz izlew..."
            autoFocus
            style={{
              flex: 1, padding: "12px 15px", fontSize: "18px",
              border: "2px solid var(--input-border)", borderRadius: "8px",
              boxSizing: "border-box", outline: "none",
              backgroundColor: "var(--bg)", color: "var(--fg)",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 16px", fontSize: "16px",
              borderRadius: "8px", border: "2px solid var(--input-border)",
              backgroundColor: "var(--bg-item)", color: "var(--fg)",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Izlew
          </button>
        </form>

        {filteredWords.length > 0 && (
          <ul style={{
            listStyle: "none", padding: "0", margin: "10px 0 0 0",
            border: "1px solid var(--border-light)", borderRadius: "8px",
            boxShadow: "0 4px 6px var(--shadow)", overflow: "hidden",
          }}>
            {filteredWords.map((entry) => {
              const displayHeadword = isRussian
                ? entry.source
                : convertScript(entry.source, fromParam, script);
              const wordHref = `/${toPairSegment(fromParam, toParam)}/${script}/${encodeURIComponent(entry.source)}`;
              const rawTranslation = entry.karakalpak[0] ?? "";
              const displayTranslation = isRussian
                ? rawTranslation
                : convertScript(rawTranslation, toParam, script);
              return (
                <li key={entry.source} style={{ borderBottom: "1px solid var(--border-lighter)" }}>
                  <Link
                    href={wordHref}
                    style={{
                      display: "block", padding: "12px 15px",
                      textDecoration: "none", color: "var(--fg)",
                      fontSize: "16px", backgroundColor: "var(--bg-item)",
                    }}
                  >
                    <strong>{displayHeadword}</strong>
                    {isRussian ? (
                      <span
                        style={{ color: "var(--fg-muted)", marginLeft: "10px", fontSize: "14px" }}
                        dangerouslySetInnerHTML={{ __html: `→ ${displayTranslation.substring(0, 60)}…` }}
                      />
                    ) : (
                      <span style={{ color: "var(--fg-muted)", marginLeft: "10px", fontSize: "14px" }}>
                        → {displayTranslation.substring(0, 40)}…
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {showNoResults && (
          <p style={{ marginTop: "15px", color: "#ff0000", textAlign: "center" }}>
            Keshirersiz, "{query}" sóziniń awdarması tabılmadı
          </p>
        )}
      </div>
    </main>
  );
}

