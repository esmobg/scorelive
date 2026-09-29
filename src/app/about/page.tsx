import { AboutPage } from "@/components/pages/about-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "За нас",
  description:
    "ScoreLive е отворена платформа за турнири — клубове, училища и общности.",
  openGraph: {
    title: "За ScoreLive",
    description:
      "Отворена платформа за турнири с групи, елиминации и първенства.",
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}
