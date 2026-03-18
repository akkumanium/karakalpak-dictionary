import { type LangCode } from "./languages";

const DOTLESS_I = /\u0131/g;    // ı
const UPPER_DOTLESS_I = "\u00CD"; // Í
const LOWER_I_ACUTE = /\u00ED/g;  // í

export function normalizeSearchCase(input: string, lang: LangCode): string {
  const replaced = input.replace(/С‘/gi, "Рµ");
  if (lang === "kaa") {
    return replaced.replace(DOTLESS_I, UPPER_DOTLESS_I).toUpperCase();
  }
  return replaced.toUpperCase();
}

export function normalizeLookupKey(input: string, lang: LangCode): string {
  let lower = input.normalize("NFC").toLowerCase();
  if (lang === "kaa") {
    lower = lower.replace(LOWER_I_ACUTE, "\u0131");
  }
  return lower.trim();
}
