import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { SkipLink } from "@/components/a11y/skip-link";
import { SiteFooter, SiteHeader } from "@/components/layout/site-shell";
import { LocaleProvider } from "@/i18n/locale-provider";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { FavoritesProvider } from "@/lib/favorites-provider";
import { TournamentStoreProvider } from "@/lib/storage/use-tournament-store";
import {
  ThemeProvider,
  themeBootScript,
} from "@/lib/theme/theme-provider";
import { SITE_URL } from "@/lib/social";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ScoreLive — турнирната платформа",
    template: "%s · ScoreLive",
  },
  description:
    "Отворена платформа за турнири: организирайте групи, елиминации и първенства, въвеждайте резултати и следете класирането.",
  openGraph: {
    type: "website",
    locale: "bg_BG",
    alternateLocale: ["en_US"],
    siteName: "ScoreLive",
    title: "ScoreLive — турнирната платформа",
    description:
      "Отворена платформа за турнири: групи, елиминации, първенства и живо класиране.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "ScoreLive — турнирната платформа",
    description:
      "Отворена платформа за турнири: групи, елиминации, първенства и живо класиране.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bg"
      className={`${display.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-full flex-col font-[family-name:var(--font-body)]">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <FavoritesProvider>
                <TournamentStoreProvider>
                  <SkipLink />
                  <SiteHeader />
                  <main id="main-content" className="flex-1">
                    {children}
                  </main>
                  <SiteFooter />
                </TournamentStoreProvider>
              </FavoritesProvider>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
