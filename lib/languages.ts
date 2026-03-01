export type LangCode = "uz" | "kaa" | "ru";
export type Script = "lat" | "cyr";

export interface Direction {
  from: LangCode;
  to: LangCode;
  label: string;
}

export const DIRECTIONS: Direction[] = [
  { from: "uz", to: "kaa", label: "Oʻzbekcha → Qaraqalpaqsha" },
  { from: "ru", to: "kaa", label: "Русский → Қарақалпақша" },
];

export const LANG_NAMES: Record<LangCode, { lat: string; cyr: string }> = {
  uz:  { lat: "Oʻzbekcha",      cyr: "Ўзбекча"       },
  kaa: { lat: "Qaraqalpaqsha",  cyr: "Қарақалпақша"  },
  ru:  { lat: "Русский",        cyr: "Русский"        },
};

export const DEFAULT_DIRECTION = DIRECTIONS[0];
export const DEFAULT_SCRIPT: Script = "lat";