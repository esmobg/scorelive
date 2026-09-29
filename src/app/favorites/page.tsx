import { FavoritesPage } from "@/components/pages/favorites-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Любими",
  description: "Запазени турнири в Turnyfly.",
};

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
