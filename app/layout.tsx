import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { 
    default: "O'zbekcha–Qoraqalpoqcha lug'at | Узбекско-каракалпакский словарь", 
    template: "%s | O'zbekcha–Qoraqalpoqcha lug'at" 
  },
  description: "Bepul onlayn o'zbekcha-qoraqalpoqcha lug'at. O'zbek tilidagi so'zlarni qidiring va qoraqalpoqcha tarjimasini toping. Бесплатный узбекско-каракалпакский словарь онлайн.",
  keywords: [
    "o'zbekcha lug'at", "qoraqalpoqcha lug'at", "uzbekcha qoraqalpoqcha tarjima", 
    "узбекский словарь", "каракалпакский словарь", "перевод узбекский каракалпакский",
    "ózbek-qaraqalpaq sózligi", "qaraqalpaqsha sózlik", "onlayn lug'at"
  ],
  openGraph: {
    title: "O'zbekcha–Qoraqalpoqcha lug'at (Uzbek–Karakalpak Dictionary)",
    description: "O'zbek tilidagi so'zlarni qidiring va qoraqalpoqcha tarjimasini darhol toping.",
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
    <html lang="en" suppressHydrationWarning>
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}