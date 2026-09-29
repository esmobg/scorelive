import type { Metadata } from "next";
import { PublicTournamentPage } from "@/components/pages/public-tournament";
import { SITE_URL } from "@/lib/social";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const title = `Турнир ${id}`;
  const description =
    "Следете класиране, схема и мачове на живо в ScoreLive.";
  const url = `${SITE_URL}/tournaments/${id}`;
  return {
    title,
    description,
    openGraph: {
      title: `${title} · ScoreLive`,
      description,
      url,
      type: "website",
      siteName: "ScoreLive",
    },
    twitter: {
      card: "summary",
      title: `${title} · ScoreLive`,
      description,
    },
  };
}

export default function TournamentPublicPage() {
  return <PublicTournamentPage />;
}
