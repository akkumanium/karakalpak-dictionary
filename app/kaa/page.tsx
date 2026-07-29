import { Suspense } from "react";
import { getDictionaryList, AVAILABLE_PAIRS } from "../../lib/dictionary";
import SearchComponent from "../SearchComponent";

const title = "Qaraqalpaq tiliniń túsindirme sózligi | Толковый Каракалпакский словарь | QQ sózlik";
const description = "Qaraqalpaq tiliniń túsindirme sozligi onlayn. Толковый словарь для каракалпакского языка онлайн. Қарақалпақ тилиниң түсиндирме сөзлиги.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/kaa",
  },
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default async function KaaKaaPage({
  searchParams,
}: {
  searchParams: Promise<{ script?: string }>;
}) {
  const params = await searchParams;
  const dictionary = await getDictionaryList("kaa", "kaa") ?? [];

  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "10vh" }}>Sózlik júklenip atır...</div>}>
      <SearchComponent
        availablePairs={AVAILABLE_PAIRS}
        from="kaa"
        to="kaa"
      />
    </Suspense>
  );
}