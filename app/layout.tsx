import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { FaTelegram } from 'react-icons/fa';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const TELEGRAM_URL = "https://t.me/qq_sozlik";

export const metadata: Metadata = {
  title: {
    default: "QQ Sózlik",
    template: "%s"
  },
  description: "Pulsız onlayn qaraqalpaqsha sózlik. Bepul onlayn qoraqalpoqcha lugʻat. Бесплатный каракалпакский словарь онлайн.",
  keywords: [
    "qaraqalpaqsha sózlik",
    "qoraqalpoqcha lug'at",
    "o'zbekcha qoraqalpoqcha lug'at",
    "uzbekcha qoraqalpoqcha tarjima",
    "ózbek-qaraqalpaq sózlik",
    "rus-qaraqalpaq sózlik",
    "sozlik",
    "русский каракалпакский словарь",
    "узбекский каракалпакский словарь",
    "перевод русский каракалпакский",
    "перевод узбекский каракалпакский",
    "қарақалпақша сөзлик",
    "өзбекше қарақалпақша сөзлик",
    "русша қарақалпақша сөзлик",
    "созлик",
    "dictionary",
    "online qoraqalpoq lug'at",
    "onlayn lug'at",
    "qq sózlik",
    "qqsozlik",
    "sóziniń mánisi",
    "degen ne",
    "деген не",
  ],
  openGraph: {
    title: "QQ Sózlik",
    description: "Pulsız onlayn qaraqalpaqsha sózlik. Bepul onlayn qoraqalpoqcha lugʻat. Бесплатный каракалпакский словарь онлайн.",
    type: "website",
    locale: "uz_UZ",
  },
  alternates: {
    languages: {
      'uz-UZ': '/uz',
      'kaa-UZ': '/kaa',
      'ru-RU': '/ru',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kaa" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var saved = localStorage.getItem('theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            var theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
          })();
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <div className="site-shell">
            <header className="site-header">
              <div className="site-container header-inner">
                <Link href="/" className="brand">
                  <span className="brand-title">QQ Sózlik</span>
                </Link>
                <div className="header-actions">
                  <nav className="header-links" aria-label="Site">
                    <Link href="/about" className="header-link">
                      Joybar haqqında
                    </Link>
                  </nav>
                </div>
              </div>
            </header>

            <main style={{ flex: 1 }}>
              {children}
            </main>

            <footer className="site-footer">
              <div className="site-container footer-inner">
                <div className="footer-brand">
                  <span className="footer-title">QQ Sózlik</span>
                  <span className="footer-copy">© {new Date().getFullYear()}</span>
                </div>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-link"
                >
                  <FaTelegram className="footer-icon" /> Telegram
                </a>
              </div>
            </footer>

          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

