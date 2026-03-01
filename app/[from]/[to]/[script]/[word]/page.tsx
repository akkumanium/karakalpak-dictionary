import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { LANG_NAMES, type LangCode, type Script } from "../../../../../lib/languages";
import { convertScript } from "../../../../../lib/transliterate";
import { getDictionaryEntry, AVAILABLE_PAIRS } from "../../../../../lib/dictionary";

interface Params { from: LangCode; to: Exclude<LangCode, "ru">; script: Script; word: string; }

export const revalidate = 86400;
export const dynamicParams = true;

// ─── HTML Translation Renderer ────────────────────────────────────────────────

type Token = { type: "text" | "b" | "i"| "br"; content: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  // Group 1 & 2: b/i and content | Group 3: br
  const regex = /<(b|i)>(.*?)<\/\1>|<(br)\s*\/?>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    // 1. Handle preceding text
    if (match.index > lastIndex) {
      const text = html.slice(lastIndex, match.index);
      if (text) tokens.push({ type: "text", content: text });
    }

    // 2. Distinguish between paired tags and void tags
    if (match[3] === "br") {
      // It's a <br>, so type is "br" and content is empty
      tokens.push({ type: "br", content: "" });
    } else {
      // It's a <b> or <i>
      tokens.push({ 
        type: match[1] as "b" | "i", 
        content: match[2] || "" 
      });
    }

    lastIndex = regex.lastIndex;
  }

  // 3. Handle trailing text
  if (lastIndex < html.length) {
    tokens.push({ type: "text", content: html.slice(lastIndex) });
  }

  return tokens;
}

const isMainNum = (s: string) => /^\s*\d+\.\s*$/.test(s);
const isSubNum  = (s: string) => /^\s*\d+\)\s*$/.test(s);

function TranslationHtml({ html, lang, script }: { html: string; lang: LangCode; script: Script }) {
  const tokens = tokenize(html);
  const nodes: React.ReactNode[] = [];
  tokens.forEach((t, i) => {
    if (t.type === "b") {
      if (isMainNum(t.content)) {
        if (i > 0) nodes.push(<br key={`br-${i}`} />);
        nodes.push(
          <strong key={i} style={{ marginRight: 4 }}>
            {t.content.trim()}
          </strong>
        );
      } else if (isSubNum(t.content)) {
        nodes.push(<br key={`br-${i}`} />);
        nodes.push(
          <strong key={i} style={{ marginLeft: "1.5em", marginRight: 4 }}>
            {t.content.trim()}
          </strong>
        );
      } else {
        nodes.push(<br key={`br-${i}`} />);
        nodes.push(
          <strong key={i} style={{ marginLeft: "1em" }}>
            {t.content}
          </strong>
        );
      }
    } else if (t.type === "i") {
      nodes.push(
        <em key={i} style={{ opacity: 0.6, fontSize: "0.88em", marginRight: 2 }}>
          {t.content}
        </em>
      );
    } else if (t.type === "br") {
      nodes.push(<br key={i} />);
    } else {
      nodes.push(<span key={i}>{convertScript(t.content, lang, script)}</span>);
    }
  });
  return <div style={{ lineHeight: 1.9, fontSize: 17, color: "var(--fg)" }}>{nodes}</div>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { word, from, to, script } = await params;
  const decoded = decodeURIComponent(word);
  const entry = await getDictionaryEntry(from, to, decoded);
  if (!entry) return {};

  const fromName    = LANG_NAMES[from]?.[script] ?? from;
  const toName      = LANG_NAMES[to]?.[script]   ?? to;
  const displayWord = (from as string) === "ru" ? entry.source : convertScript(entry.source, from, script);
  const title       = `${displayWord} — ${fromName}–${toName} Dictionary`;
  const description = `Definition and translation of "${displayWord}" from ${fromName} to ${toName}.`;
  return { title, description, openGraph: { title, description, type: "article" } };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WordPage({ params }: { params: Promise<Params> }) {
  const { from, to, script, word } = await params;
  const decoded = decodeURIComponent(word);

  const validPair = AVAILABLE_PAIRS.includes(`${from}-${to}`);
  if (!validPair || !["lat", "cyr"].includes(script)) notFound();

  const entry = await getDictionaryEntry(from, to, decoded);
  if (!entry) notFound();

  const backHref = `/?from=${from}&to=${to}&script=${script}`;
  const displayHeadword = (from as string) === "ru" ? entry.source : convertScript(entry.source, from, script);

  const isHtml = (from as string) === "ru";

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", fontFamily: "system-ui, sans-serif", padding: "20px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Link href={backHref} style={{ color: "var(--fg-subtle)", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Search
        </Link>

        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
          {(["lat", "cyr"] as Script[]).map((s) => {
            const href = `/${from}/${to}/${s}/${encodeURIComponent(decoded)}`;
            const active = s === script;
            return (
              <Link key={s} href={href} style={{
                padding: "6px 14px", fontSize: "13px", textDecoration: "none",
                backgroundColor: active ? "var(--bg-active)" : "var(--bg-item)",
                color: active ? "var(--fg-active)" : "var(--fg)",
                fontWeight: active ? "600" : "400",
              }}>
                {s === "lat" ? "Latin" : "Кирил"}
              </Link>
            );
          })}
        </div>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: "600", margin: "0 0 4px", color: "var(--fg)" }}>
        {displayHeadword}
      </h1>
      <p style={{ color: "var(--fg-muted)", fontSize: "13px", margin: "0 0 24px" }}>
        {LANG_NAMES[from]?.[script] ?? from} → {LANG_NAMES[to]?.[script] ?? to}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {entry.karakalpak.map((def, i) => (
          <div key={i} style={{ color: "var(--fg)" }}>
            {isHtml
              ? <TranslationHtml html={def} lang={to} script={script} />
              : <span style={{ fontSize: 17, lineHeight: 1.6 }}>{convertScript(def, to, script)}</span>
            }
          </div>
        ))}
      </div>

    </div>
  );
}