import Link from "next/link";

const title = "Сайт туўралы | QQ Sózlik";
const description =
  "QQ Sózlik жойбары және байланыс туўралы мағлыўмат.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
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

export default function AboutPage() {
  return (
    <section className="site-container about-page">
      <div className="about-hero">
        <div className="about-header">
          <p className="about-eyebrow">сайт хаққында</p>
          <h1 className="about-title">
            QQ Sózlik - қарақалпақ тили ушын онлайн сөзлик
          </h1>
          <p className="about-lead">
            Бул сайтты Қазақстанның Астана қаласындағы жас студент жеке өзи жаратты. 
            Барлығы мениң өз қаржым ҳәм мийнетим арқалы жүзеге келди. Егер бул сайтты қоллап-қуватлағыңыз келсе: <br></br>
            4400 4303 5052 4788 - Kaspi Bank картасы (Өзбекистаннан ақша жибериўге болады)
          </p>
          <div className="about-note">
            <span className="about-note-text">
              Усыныс яки қәте болса, бизге жибериңиз - сөзликти бирге дамытайық.
            </span>
            <a
              className="about-note-link"
              href="https://t.me/qq_sozlik"
              target="_blank"
              rel="noreferrer"
            >
              Telegram арқалы байланыс
            </a>
          </div>
        </div>
      </div>

      <div className="about-footer">
        <Link href="/uz-kaa" className="about-back">
          Сөзликке қайтыў
        </Link>
      </div>
    </section>
  );
}
