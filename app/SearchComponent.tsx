"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { type DictionaryEntry } from "../lib/dictionary";
import { DIRECTIONS, LANG_NAMES, type Script, type LangCode } from "../lib/languages";
import { convertScript } from "../lib/transliterate";
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
  const [isPending,     startTransition ] = useTransition();

  useEffect(() => setMounted(true), []);

  const isPairValid = availablePairs.includes(`${fromParam}-${toParam}`);

  function buildUrl(overrides: { from?: string; to?: string; script?: string }) {
    const f = overrides.from   ?? fromParam;
    const t = overrides.to     ?? toParam;
    const s = overrides.script ?? script;
    const basePath = `/${f}-${t}`;
    if (f === "ru") return basePath;
    return `${basePath}?script=${s}`;
  }

  // ── Server search ──────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(
    async (q: string, currentScript: Script) => {
      if (!isPairValid || q.trim().length < 1) {
        setFilteredWords([]);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          from:   fromParam,
          to:     toParam,
          q:      q.trim(),
          script: currentScript,
        });
        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        if (!res.ok) return;
        const data: DictionaryEntry[] = await res.json();
        setFilteredWords(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err);
      }
    },
    [fromParam, toParam, isPairValid],
  );

  // Debounce: wait 150 ms after the user stops typing
  useEffect(() => {
    const id = setTimeout(() => runSearch(query, script), 150);
    return () => clearTimeout(id);
  }, [query, script, runSearch]);

  // ── Query / script change handler ──────────────────────────────────────────
  const handleQueryChange = (val: string) => {
    setQuery(val);
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

      {/* ── Cyrillic character buttons (Uzbek Cyrillic only) ── */}
      {script === "cyr" && !isRussian && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", justifyContent: "center" }}>
          {["ҳ", "қ", "ғ", "ў"].map((char) => (
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
      )}

      {/* ── Search ── */}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Sóz izleń..."
          autoFocus
          style={{
            width: "100%", padding: "12px 15px", fontSize: "18px",
            border: "2px solid var(--input-border)", borderRadius: "8px",
            boxSizing: "border-box", outline: "none",
            backgroundColor: "var(--bg)", color: "var(--fg)",
          }}
        />

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
              const wordHref = `/${fromParam}/${toParam}/${script}/${encodeURIComponent(entry.source)}`;
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

        {query.length > 0 && filteredWords.length === 0 && (
          <p style={{ marginTop: "15px", color: "#ff0000", textAlign: "center" }}>
          </p>
        )}
      </div>
    </main>
  );
}