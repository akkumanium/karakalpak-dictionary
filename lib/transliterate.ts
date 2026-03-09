export type LangCode = "uz" | "kaa"| "ru";
export type Script = "lat" | "cyr";

type ReplacerFn = (match: string, ...groups: any[]) => string;
type MapEntry = [RegExp | string, string | ReplacerFn];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const APOSTROPHES = /[\u2018\u2019\u02BC\u02BB`']/g;

function normalizeApostrophes(input: string) {
  return input.replace(APOSTROPHES, "'");
}

function ensureRegex(from: RegExp | string): RegExp {
  if (from instanceof RegExp) {
    const flags = from.flags.includes("g") ? from.flags : from.flags + "g";
    return new RegExp(from.source, flags);
  } else {
    return new RegExp(escapeRegExp(from), "g");
  }
}

function applyMap(text: string, map: MapEntry[]): string {
  let result = text;
  for (const [from, to] of map) {
    const rx = ensureRegex(from);
    if (typeof to === "function") {
      result = result.replace(rx, to as ReplacerFn);
    } else {
      result = result.replace(rx, to);
    }
  }
  return result;
}

const UZ_LAT_TO_CYR: MapEntry[] = [
  [/ya/gi, (m: string) => m === m.toUpperCase() ? "Я" : m[0] === m[0].toUpperCase() ? "Я" : "я"],
  [/O'/g, "Ў"], [/o'/g, "ў"],
  [/yo/gi, (m: string) => m === m.toUpperCase() ? "Ё" : m[0] === m[0].toUpperCase() ? "Ё" : "ё"],
  [/yu/gi, (m: string) => m === m.toUpperCase() ? "Ю" : m[0] === m[0].toUpperCase() ? "Ю" : "ю"],
  [/ye/gi, (m: string) => m === m.toUpperCase() ? "Е" : m[0] === m[0].toUpperCase() ? "Е" : "е"],
  [/\bE/g, "Э"], [/\be/g, "э"],
  [/sh/gi, (m: string) => (m === m.toUpperCase() ? "Ш" : "ш")],
  [/ch/gi, (m: string) => (m === m.toUpperCase() ? "Ч" : "ч")],

  [/G'/g, "Ғ"], [/g'/g, "ғ"],
  [/'/g, "Ъ"],

  [/A/g, "А"], [/a/g, "а"],
  [/B/g, "Б"], [/b/g, "б"],
  [/D/g, "Д"], [/d/g, "д"],
  [/E/g, "Е"], [/e/g, "е"],
  [/F/g, "Ф"], [/f/g, "ф"],
  [/G/g, "Г"], [/g/g, "г"],
  [/H/g, "Ҳ"], [/h/g, "ҳ"],
  [/I/g, "И"], [/i/g, "и"],
  [/J/g, "Ж"], [/j/g, "ж"],
  [/K/g, "К"], [/k/g, "к"],
  [/L/g, "Л"], [/l/g, "л"],
  [/M/g, "М"], [/m/g, "м"],
  [/N/g, "Н"], [/n/g, "н"],
  [/O/g, "О"], [/o/g, "о"],
  [/P/g, "П"], [/p/g, "п"],
  [/Q/g, "Қ"], [/q/g, "қ"],
  [/R/g, "Р"], [/r/g, "р"],
  [/S/g, "С"], [/s/g, "с"],
  [/T/g, "Т"], [/t/g, "т"],
  [/U/g, "У"], [/u/g, "у"],
  [/V/g, "В"], [/v/g, "в"],
  [/X/g, "Х"], [/x/g, "х"],
  [/Y/g, "Й"], [/y/g, "й"],
  [/Z/g, "З"], [/z/g, "з"],
];

const KAA_LAT_TO_CYR: MapEntry[] = [

  [/ya/gi, (m: string) => m === m.toUpperCase() ? "Я" : m[0] === m[0].toUpperCase() ? "Я" : "я"],
  [/yo/gi, (m: string) => m === m.toUpperCase() ? "Ё" : m[0] === m[0].toUpperCase() ? "Ё" : "ё"],
  [/yu/gi, (m: string) => m === m.toUpperCase() ? "Ю" : m[0] === m[0].toUpperCase() ? "Ю" : "ю"],
  [/ye/gi, (m: string) => m === m.toUpperCase() ? "ЙЕ" : m[0] === m[0].toUpperCase() ? "ЙЕ" : "йе"],
  [/sh/gi, (m: string) => (m === m.toUpperCase() ? "Ш" : "ш")],
  [/ch/gi, (m: string) => (m === m.toUpperCase() ? "Ч" : "ч")],
  [/ts/gi, (m: string) => (m === m.toUpperCase() ? "Ц" : "ц")],

  [/á/gi, (m: string) => (m === m.toUpperCase() ? "Ә" : "ә")],
  [/ǵ/gi, (m: string) => (m === m.toUpperCase() ? "Ғ" : "ғ")],
  [/ń/gi, (m: string) => (m === m.toUpperCase() ? "Ң" : "ң")],
  [/ó/gi, (m: string) => (m === m.toUpperCase() ? "Ө" : "ө")],
  [/ú/gi, (m: string) => (m === m.toUpperCase() ? "Ү" : "ү")],

  [/A/g, "А"], [/a/g, "а"],
  [/B/g, "Б"], [/b/g, "б"],
  [/D/g, "Д"], [/d/g, "д"],
  [/E/g, "Е"], [/e/g, "е"],
  [/F/g, "Ф"], [/f/g, "ф"],
  [/G/g, "Г"], [/g/g, "г"],
  [/H/g, "Х"], [/h/g, "х"],
  [/Í/g, "Ы"], [/ı/g, "ы"],
  [/I/g, "I"], [/i/g, "и"],
  [/J/g, "Ж"], [/j/g, "ж"],
  [/K/g, "К"], [/k/g, "к"],
  [/Q/g, "Қ"], [/q/g, "қ"],
  [/L/g, "Л"], [/l/g, "л"],
  [/M/g, "М"], [/m/g, "м"],
  [/N/g, "Н"], [/n/g, "н"],
  [/O/g, "О"], [/o/g, "о"],
  [/P/g, "П"], [/p/g, "п"],
  [/R/g, "Р"], [/r/g, "р"],
  [/S/g, "С"], [/s/g, "с"],
  [/T/g, "Т"], [/t/g, "т"],
  [/U/g, "У"], [/u/g, "у"],
  [/V/g, "В"], [/v/g, "в"],
  [/W/g, "Ў"], [/w/g, "ў"],
  [/X/g, "Х"], [/x/g, "х"],
  [/Y/g, "Й"], [/y/g, "й"],
  [/Z/g, "З"], [/z/g, "з"],
];

export function toLatin(text: string, _lang: LangCode): string {
  return text;
}

export function toCyrillic(input: string, lang: LangCode): string {
  const text = normalizeApostrophes(input);
  const map = lang === "uz" ? UZ_LAT_TO_CYR : KAA_LAT_TO_CYR;
  return applyMap(text, map);
}

export function convertScript(text: string, lang: LangCode, script: Script): string {
  const inputIsCyrillic = /[а-яёА-ЯЁ\u04B0-\u04B1\u04E8\u04E9]/u.test(text);

  if (script === "lat") {
    return inputIsCyrillic ? toLatinFromCyrillic(text, lang) : text;
  } else {
    return inputIsCyrillic ? text : toCyrillic(text, lang);
  }
}

const UZ_CYR_TO_LAT: [RegExp, string][] = [
  [/Я/g,"YA"],[/я/g,"ya"],
  [/Ё/g,"YO"],[/ё/g,"yo"],
  [/Ю/g,"YU"],[/ю/g,"yu"],
  [/\bЕ/g, "YE"], [/\bе/g, "ye"],

  [/Ш/g,"SH"],[/ш/g,"sh"],
  [/Ч/g,"CH"],[/ч/g,"ch"],
  [/А/g,"A"],[/а/g,"a"],
  [/Б/g,"B"],[/б/g,"b"],
  [/Д/g,"D"],[/д/g,"d"],
  [/Е/g,"E"],[/е/g,"e"],
  [/Э/g,"E"],[/э/g,"e"],
  [/Ф/g,"F"],[/ф/g,"f"],
  [/Ғ/g,"Gʻ"],[/ғ/g,"g‘"],   
  [/Г/g,"G"],[/г/g,"g"],
  [/Ҳ/g,"H"],[/ҳ/g,"h"],
  [/И/g,"I"],[/и/g,"i"],
  [/Ж/g,"J"],[/ж/g,"j"],
  [/К/g,"K"],[/к/g,"k"],
  [/Л/g,"L"],[/л/g,"l"],
  [/М/g,"M"],[/м/g,"m"],
  [/Н/g,"N"],[/н/g,"n"],
  [/Ў/g,"Oʻ"],[/ў/g,"oʻ"],
  [/О/g,"O"],[/о/g,"o"],
  [/П/g,"P"],[/п/g,"p"],
  [/Қ/g,"Q"],[/қ/g,"q"],
  [/Р/g,"R"],[/р/g,"r"],
  [/С/g,"S"],[/с/g,"s"],
  [/Т/g,"T"],[/т/g,"t"],
  [/У/g,"U"],[/у/g,"u"],
  [/В/g,"V"],[/в/g,"v"],
  [/Х/g,"X"],[/х/g,"x"],
  [/Й/g,"Y"],[/й/g,"y"],
  [/З/g,"Z"],[/з/g,"z"],
  [/Ъ/g,"’"],[/ъ/g,"’"],
];

const KAA_CYR_TO_LAT: [RegExp, string][] = [
  [/Я/g,"YA"],[/я/g,"ya"],
  [/Ё/g,"YO"],[/ё/g,"yo"],
  [/Ю/g,"YU"],[/ю/g,"yu"],

  [/Ш/g,"SH"],[/ш/g,"sh"],
  [/Ч/g,"CH"],[/ч/g,"ch"],
  [/Ц/g,"TS"],[/ц/g,"ts"],
  [/Ә/g,"Á"],[/ә/g,"á"],
  [/Ғ/g,"Ǵ"],[/ғ/g,"ǵ"],
  [/Ң/g,"Ń"],[/ң/g,"ń"],
  [/Ө/g,"Ó"],[/ө/g,"ó"],
  [/Ү/g,"Ú"],[/ү/g,"ú"],
  [/А/g,"A"],[/а/g,"a"],
  [/Б/g,"B"],[/б/g,"b"],
  [/Д/g,"D"],[/д/g,"d"],
  [/Е/g,"E"],[/е/g,"e"],
  [/Ф/g,"F"],[/ф/g,"f"],
  [/Г/g,"G"],[/г/g,"g"],
  [/Х/g,"X"],[/х/g,"x"],
  [/И/g,"I"],[/и/g,"i"],
  [/Ж/g,"J"],[/ж/g,"j"],
  [/К/g,"K"],[/к/g,"k"],
  [/Қ/g,"Q"],[/қ/g,"q"],
  [/Л/g,"L"],[/л/g,"l"],
  [/М/g,"M"],[/м/g,"m"],
  [/Н/g,"N"],[/н/g,"n"],
  [/О/g,"O"],[/о/g,"o"],
  [/П/g,"P"],[/п/g,"p"],
  [/Р/g,"R"],[/р/g,"r"],
  [/С/g,"S"],[/с/g,"s"],
  [/Т/g,"T"],[/т/g,"t"],
  [/У/g,"U"],[/у/g,"u"],
  [/В/g,"V"],[/в/g,"v"],
  [/Й/g,"Y"],[/й/g,"y"],
  [/З/g,"Z"],[/з/g,"z"],
  [/Э/g,"E"],[/э/g,"e"],
  [/Ы/g,"Í"],[/ы/g,"ı"],
  [/Ў/g,"W"],[/ў/g,"w"],
  [/Ҳ/g,"H"],[/ҳ/g,"h"],
  [/Ь/g,""],[/ь/g,""],
  [/Ъ/g,"Y"],[/ъ/g,"y"],
];

export function toLatinFromCyrillic(text: string, lang: LangCode): string {
  const map = lang === "uz" ? UZ_CYR_TO_LAT : KAA_CYR_TO_LAT;
  return applyMap(text, map);
}