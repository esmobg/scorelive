import { PrivacyPage } from "@/components/pages/privacy-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Поверителност",
  description:
    "Как ScoreLive обработва акаунти, турнири, сесии и хостинг данни.",
  openGraph: {
    title: "Поверителност — ScoreLive",
    description:
      "Акаунти, турнири, сесии, Turso rate limits и опционални имейли за нулиране на парола.",
  },
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
