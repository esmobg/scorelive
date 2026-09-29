import { FaqPage } from "@/components/pages/faq-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ЧЗВ",
  description:
    "Често задавани въпроси за ScoreLive: акаунти, данни, формати и езици.",
  openGraph: {
    title: "ЧЗВ · ScoreLive",
    description: "Кратки отговори за демото и текущите възможности.",
  },
};

export default function FaqRoute() {
  return <FaqPage />;
}
