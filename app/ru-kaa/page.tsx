import { Suspense } from "react";
import { getDictionaryList, AVAILABLE_PAIRS } from "../../lib/dictionary";
import SearchComponent from "../SearchComponent";

export const metadata = {
  title: "Qaraqalpaqsha – Orıssha sózlik, awdarmashı | Каракалпакский – Русский онлайн словарь и переводчик",
  description: "Orıs tilinen Qaraqalpaq tiline online sózlik. Переводчик с русского на каракалпакский онлайн.",
};

export default async function RuKaaPage({
  searchParams,
}: {
  searchParams: Promise<{ script?: string }>;
}) {
  const params = await searchParams;
  const dictionary = await getDictionaryList("ru", "kaa") ?? [];

  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "10vh" }}>Sózlik júklenip atır...</div>}>
      <SearchComponent
        availablePairs={AVAILABLE_PAIRS}
        from="ru"
        to="kaa"
      />
    </Suspense>
  );
}