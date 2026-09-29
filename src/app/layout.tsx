import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { SkipLink } from "@/components/a11y/skip-link";
import { SiteFooter, SiteHeader } from "@/components/layout/site-shell";
import { TournamentStoreProvider } from "@/lib/storage/use-tournament-store";
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
  title: {
    default: "Turnyfly — турнирната платформа",
    template: "%s · Turnyfly",
  },
  description:
    "Отворена платформа за турнири: организирайте групи и елиминации, въвеждайте резултати и следете класирането.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bg"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-[family-name:var(--font-body)]">
        <TournamentStoreProvider>
          <SkipLink />
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </TournamentStoreProvider>
      </body>
    </html>
  );
}
