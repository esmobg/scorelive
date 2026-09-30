import { PrivacyPage } from "@/components/pages/privacy-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Поверителност",
  description:
    "Как ScoreLive обработва акаунти, турнири, сесии и хостинг данни.",
  openGraph: {
    title: "Поверителност — ScoreLive",
    description:
      "Данни за акаунти и турнири, Turso хостинг, бисквитки/сесии. Без плащания и OAuth.",
  },
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
