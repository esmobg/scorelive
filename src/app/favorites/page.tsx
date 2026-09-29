import { FavoritesPage } from "@/components/pages/favorites-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Любими",
  description: "Запазени турнири в ScoreLive.",
};

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
