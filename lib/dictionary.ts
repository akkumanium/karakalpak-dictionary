// lib/dictionary.ts (server-only)

import "server-only";
import path from "path";
import fs from "fs/promises";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "dictionary.json");

    const raw = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(raw);

    return Response.json(json);
  } catch (err) {
    console.error(err);
    return Response.json(null, { status: 500 });
  }
}

export interface DictionaryEntry {
  source: string;
  karakalpak: string[];
}

const FILES: Record<string, { filePath: string; sourceKey: string; targetKey: string }> = {
  "uz-kaa": { filePath: path.join(process.cwd(), "data", "uz-kaa.json"), sourceKey: "uzbek",  targetKey: "karakalpak" },
  "ru-kaa": { filePath: path.join(process.cwd(), "data", "ru-kaa.json"), sourceKey: "word",   targetKey: "translation" },
};

type Cached = { list: DictionaryEntry[]; map: Map<string, DictionaryEntry> };
const CACHE: Record<string, Cached | undefined> = {};

async function loadPair(pair: string): Promise<Cached | null> {
  if (CACHE[pair]) return CACHE[pair]!;

  const config = FILES[pair];
  if (!config) return null;

  let raw: any[];
  try {
    raw = JSON.parse(await fs.readFile(config.filePath, "utf8"));
  } catch {
    return null;
  }

  const map = new Map<string, DictionaryEntry>();
  const list: DictionaryEntry[] = [];

  for (const e of raw) {
    const source = String(e[config.sourceKey] ?? "").normalize("NFC").trim();
    if (!source) continue;

    const rawTarget = e[config.targetKey];
    const karakalpak: string[] = Array.isArray(rawTarget)
        ? rawTarget
        : rawTarget
        ? [String(rawTarget)]
        : [];

    const key = source.toLowerCase();
    const existing = map.get(key);

    if (existing) {
        existing.karakalpak.push(...karakalpak);
    } else {
        const entry: DictionaryEntry = { source, karakalpak: [...karakalpak] };
        map.set(key, entry);
        list.push(entry);
    }
}

  CACHE[pair] = { list, map };
  return CACHE[pair]!;
}

export async function getDictionaryEntry(
  from: string,
  to: string,
  word: string
): Promise<DictionaryEntry | null> {
  const data = await loadPair(`${from}-${to}`);
  if (!data) return null;
  return data.map.get(word.normalize("NFC").toLowerCase().trim()) ?? null;
}

export async function getDictionaryList(
  from: string,
  to: string
): Promise<DictionaryEntry[] | null> {
  const data = await loadPair(`${from}-${to}`);
  return data?.list ?? null;
}

export const AVAILABLE_PAIRS = Object.keys(FILES);