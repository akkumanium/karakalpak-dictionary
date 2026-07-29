import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { LANG_NAMES, type LangCode, type Script } from "../../../../lib/languages";
import { convertScript } from "../../../../lib/transliterate";
import { getDictionaryEntry, AVAILABLE_PAIRS } from "../../../../lib/dictionary";
import { parsePairSegment, toPairSegment } from "../../../../lib/routes";

interface Params { pair: string; script: Script; word: string; }

export const revalidate = 86400;
export const dynamicParams = true;

// ─── HTML Translation Renderer ────────────────────────────────────────────────

type Token = { type: "text" | "b" | "i"| "br"; content: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const regex = /<(b|i)>(.*?)<\/\1>|<(br)\s*\/?>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const text = html.slice(lastIndex, match.index);
      if (text) tokens.push({ type: "text", content: text });
    }
    if (match[3] === "br") {
      tokens.push({ type: "br", content: "" });
    } else {
      tokens.push({ 
        type: match[1] as "b" | "i", 
        content: match[2] || "" 
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < html.length) {
    tokens.push({ type: "text", content: html.slice(lastIndex) });
  }

  return tokens;
}

const isMainNum = (s: string) => /^\s*\d+\.\s*$/.test(s);
const isSubNum  = (s: string) => /^\s*\d+\)\s*$/.test(s);

const KAAKAA_DOT_EXCEPTIONS = new Set([
  "аўыс",
  "ат",
  "қ",
  "ф",
  "кел",
  "р",
  "дин",
  "с",
]);

const LETTER_RE = /\p{L}/u;

function getPrevWord(text: string, dotIndex: number): string {
  let i = dotIndex - 1;
  if (i < 0) return "";

  let end = i;
  while (i >= 0 && LETTER_RE.test(text[i])) i--;
  return text.slice(i + 1, end + 1);
}

function shouldSkipDotBreak(text: string, dotIndex: number): boolean {
  const prev = text[dotIndex - 1] ?? "";
  const next = text[dotIndex + 1] ?? "";

  if (prev === "." || next === ".") return true;
  if (/\d/.test(prev)) return true;
  if (next === ")") return true;
  if (next && LETTER_RE.test(next)) return true;

  const prevWord = getPrevWord(text, dotIndex).toLowerCase();
  if (prevWord && KAAKAA_DOT_EXCEPTIONS.has(prevWord)) return true;

  return false;
}

function addSentenceBreaks(text: string): string {
  let out = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== ".") {
      out += ch;
      continue;
    }

    if (shouldSkipDotBreak(text, i)) {
      out += ch;
      continue;
    }

    let j = i + 1;
    while (j < text.length && text[j] === " ") j++;
    if (j >= text.length) {
      out += ch;
      continue;
    }

    out += ".\n";
    if (text[i + 1] === " ") i++;
  }

  return out;
}

function TranslationHtml({ html, lang, script }: { html: string; lang: LangCode; script: Script }) {
  const processedHtml = html.replace(/;/g, ';<br/>');

  const tokens = tokenize(processedHtml);
  
  const nodes: React.ReactNode[] = [];
  tokens.forEach((t, i) => {
    if (t.type === "b") {
      if (isMainNum(t.content)) {
        nodes.push(
          <strong key={i} style={{ marginRight: 4 }}>
            {t.content.trim()}
          </strong>
        );
      } else if (isSubNum(t.content)) {
        nodes.push(
          <strong key={i} style={{ marginLeft: "1.5em", marginRight: 4 }}>
            {t.content.trim()}
          </strong>
        );
      } else {
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

const isLangCode = (value: string): value is LangCode =>
  Object.prototype.hasOwnProperty.call(LANG_NAMES, value);

function resolvePair(pair: string) {
  const { from, to, pairKey } = parsePairSegment(pair);
  if (!from || !to) return null;
  if (!isLangCode(from) || !isLangCode(to)) return null;
  if (!AVAILABLE_PAIRS.includes(pairKey)) return null;
  return { from, to, pairKey, pairSegment: toPairSegment(from, to) };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { word, pair, script } = await params;
  const resolved = resolvePair(pair);
  if (!resolved || !["lat", "cyr"].includes(script)) return {};
  const { from, to, pairSegment } = resolved;
  const decoded = decodeURIComponent(word);
  const entry = await getDictionaryEntry(from, to, decoded);
  if (!entry) return {};

  const fromName    = LANG_NAMES[from]?.[script] ?? from;
  const toName      = LANG_NAMES[to]?.[script]   ?? to;
  const displayWord = from === "ru" ? entry.source : convertScript(entry.source, from, script);
  const isMono      = from === to;
  const meaningPhrase = script === "cyr" ? "сөзиниң мәниси" : "sóziniń mánisi";
  const title       = isMono
    ? `${displayWord} ${meaningPhrase} | QQ sózlik`
    : `${displayWord} — ${fromName}-${toName} перевод | QQ sózlik`;
  const description = isMono
    ? `"${displayWord}" — ${fromName} | QQ sózlik | túsindirmesi | объяснение | tushuntirish.`
    : `"${displayWord}" — ${fromName}-${toName} | QQ sózlik | перевод и объяснение | awdarması hám túsindirmesi | tarjima va tushuntirish.`;
  const canonical   = `/${pairSegment}/${script}/${encodeURIComponent(decoded)}`;
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WordPage({ params }: { params: Promise<Params> }) {
  const { pair, script, word } = await params;
  const resolved = resolvePair(pair);
  if (!resolved || !["lat", "cyr"].includes(script)) notFound();
  const { from, to, pairSegment } = resolved;
  const decoded = decodeURIComponent(word);

  if (pair !== pairSegment) {
    notFound();
  }

  const entry = await getDictionaryEntry(from, to, decoded);
  if (!entry) notFound();

  const backHref = from === "ru" ? `/${pairSegment}` : `/${pairSegment}?script=${script}`;
  const displayHeadword = from === "ru" ? entry.source : convertScript(entry.source, from, script);

  const isHtml = from === "ru";
  const isKaaKaa = from === "kaa" && to === "kaa";

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", fontFamily: "system-ui, sans-serif", padding: "20px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "26px" }}>
        <Link href={backHref} style={{ color: "var(--fg-subtle)", textDecoration: "none", fontSize: "16px" }}>
          ⬅️ Basqa sóz izlew
        </Link>

        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
          {(["lat", "cyr"] as Script[]).map((s) => {
            const href = `/${pairSegment}/${s}/${encodeURIComponent(decoded)}`;
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
        {from === to
          ? (LANG_NAMES[from]?.[script] ?? from)
          : `${LANG_NAMES[from]?.[script] ?? from} → ${LANG_NAMES[to]?.[script] ?? to}`
        }
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {entry.karakalpak.map((def, i) => (
          <div key={i} style={{ color: "var(--fg)" }}>
            {isHtml
              ? <TranslationHtml html={def} lang={to} script={script} />
              : (
                <span style={{ fontSize: 17, lineHeight: 1.6, whiteSpace: isKaaKaa ? "pre-line" : "normal" }}>
                  {convertScript(isKaaKaa ? addSentenceBreaks(def) : def, to, script)}
                </span>
              )
            }
          </div>
        ))}
      </div>

    </div>
  );
}
