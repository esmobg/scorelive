import type { Metadata } from "next";
import { PublicTournamentPage } from "@/components/pages/public-tournament";

export const metadata: Metadata = {
  title: "Турнир",
};

export default function TournamentPublicPage() {
  return <PublicTournamentPage />;
}
