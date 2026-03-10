import { Suspense } from "react";
import { getDictionaryList, AVAILABLE_PAIRS } from "../../lib/dictionary";
import SearchComponent from "../SearchComponent";

export const metadata = {
  title: "Qaraqalpaqsha – Ózbekshe sózlik | Qaraqalpoqcha - O'zbekcha onlayn so'zlik",
  description: "Ózbek tilinen Qaraqalpaq tiline online sózlik. O'zbek tilinden qaraqalpaq tiline onlayn tarjimon.",
};

export default async function UzKaaPage({
  searchParams,
}: {
  searchParams: Promise<{ script?: string }>;
}) {
  const params = await searchParams;
  const dictionary = await getDictionaryList("uz", "kaa") ?? [];

  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "10vh" }}>Sózlik júklenip atır...</div>}>
      <SearchComponent
        availablePairs={AVAILABLE_PAIRS}
        from="uz"
        to="kaa"
      />
    </Suspense>
  );
}