import type { Metadata } from "next";
import { DiscoverHome } from "@/components/pages/discover-home";
import { SITE_URL } from "@/lib/social";

export const metadata: Metadata = {
  title: "Turnyfly — турнирната платформа",
  description:
    "Отворена платформа за турнири: групи, елиминации, първенства и живо класиране.",
  openGraph: {
    title: "Turnyfly — турнирната платформа",
    description:
      "Създайте турнир, въведете резултати и споделете класирането с BG/EN интерфейс.",
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turnyfly — турнирната платформа",
    description:
      "Създайте турнир, въведете резултати и споделете класирането.",
  },
};

export default function HomePage() {
  return <DiscoverHome />;
}
