import { Suspense } from "react";
import { getDictionaryList, AVAILABLE_PAIRS } from "../../lib/dictionary";
import SearchComponent from "../SearchComponent";

const title = "Russha - Qaraqalpaqsha sózlik | Русский - Каракалпакский онлайн словарь";
const description = "Rus tilinen Qaraqalpaq tiline online sózlik. Переводчик с русского на каракалпакский онлайн.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/ru-kaa",
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