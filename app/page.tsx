import { Suspense } from "react";
import { getDictionaryList, AVAILABLE_PAIRS } from "../lib/dictionary";
import { type LangCode } from "../lib/languages";
import SearchComponent from "./SearchComponent";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; script?: string }>;
}) {
  const params = await searchParams;
  const from = (params.from ?? "uz") as LangCode;
  const to   = (params.to   ?? "kaa") as Exclude<LangCode, "ru">;

  const dictionary = await getDictionaryList(from, to) ?? [];

  return (
      <Suspense fallback={<div style={{ textAlign: "center", marginTop: "10vh" }}>Loading...</div>}>
    <SearchComponent
      dictionary={dictionary}
      availablePairs={AVAILABLE_PAIRS}
      from={from}
      to={to}
    />
  </Suspense>
  );
}