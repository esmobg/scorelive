import { FaqPage } from "@/components/pages/faq-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ЧЗВ",
  description:
    "Често задавани въпроси за ScoreLive: акаунти, Turso, следене на живо, формати, език и тема.",
  openGraph: {
    title: "ЧЗВ · ScoreLive",
    description:
      "Кратки отговори за ScoreLive — отворена платформа със споделени турнири на сървъра.",
  },
};

export default function FaqRoute() {
  return <FaqPage />;
}
