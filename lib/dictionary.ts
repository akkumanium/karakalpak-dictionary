// lib/dictionary.ts (server-only)
import "server-only";
import path from "path";
import fs from "fs/promises";
import { LRUCache } from "lru-cache";

export interface DictionaryEntry {
  source: string;
  karakalpak: string[];
}

const FILES: Record<string, { filePath: string; sourceKey: string; targetKey: string }> = {
  "uz-kaa": { filePath: path.join(process.cwd(), "data", "uz-kaa.json"), sourceKey: "uzbek",  targetKey: "karakalpak" },
  "ru-kaa": { filePath: path.join(process.cwd(), "data", "ru-kaa.json"), sourceKey: "word",   targetKey: "translation" },
};

type Cached = { list: DictionaryEntry[]; map: Map<string, DictionaryEntry> };

const cache = new LRUCache<string, Cached>({ max: 50 });
const inFlight = new Map<string, Promise<Cached | null>>();

async function loadPairFromDisk(pair: string): Promise<Cached | null> {
  const cfg = FILES[pair];
  if (!cfg) return null;

  const cached = cache.get(pair);
  if (cached) return cached;

  const existing = inFlight.get(pair);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const raw = await fs.readFile(cfg.filePath, "utf8");
      const arr = JSON.parse(raw);

      if (!Array.isArray(arr)) throw new Error(`Expected array in ${cfg.filePath}`);

      const map = new Map<string, DictionaryEntry>();
      const list: DictionaryEntry[] = [];

      for (const e of arr) {
        const source = String(e[cfg.sourceKey] ?? "").normalize("NFC").trim();
        if (!source) continue;

        const key = source.toLocaleLowerCase("tr").trim();

        const rawTarget = e[cfg.targetKey];
        const targets = Array.isArray(rawTarget)
          ? rawTarget.map(String)
          : rawTarget
          ? [String(rawTarget)]
          : [];

        const existing = map.get(key);
        if (existing) {
          const set = new Set(existing.karakalpak);
          for (const t of targets) set.add(t);
          existing.karakalpak = Array.from(set);
        } else {
          const entry: DictionaryEntry = { source, karakalpak: Array.from(new Set(targets)) };
          map.set(key, entry);
          list.push(entry);
        }
      }

      const result: Cached = { list, map };
      cache.set(pair, result);
      return result;
    } catch (err) {
      console.error("Failed to load dictionary pair", pair, err);
      return null;
    } finally {
      inFlight.delete(pair);
    }
  })();

  inFlight.set(pair, promise);
  return promise;
}

export async function getDictionaryEntry(from: string, to: string, word: string): Promise<DictionaryEntry | null> {
  const data = await loadPairFromDisk(`${from}-${to}`);
  if (!data) return null;
  const key = word.normalize("NFC").toLocaleLowerCase("tr").trim();
  return data.map.get(key) ?? null;
}

export async function getDictionaryList(from: string, to: string): Promise<DictionaryEntry[] | null> {
  const data = await loadPairFromDisk(`${from}-${to}`);
  return data?.list ?? null;
}

export const AVAILABLE_PAIRS = Object.keys(FILES);