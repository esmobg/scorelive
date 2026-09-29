import { HowItWorksPage } from "@/components/pages/how-it-works-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Как работи",
  description:
    "Създайте турнир, добавете отбори, въведете резултати и споделете класирането.",
  openGraph: {
    title: "Как работи ScoreLive",
    description:
      "От създаване до споделяне — кратък поток за организатори и фенове.",
  },
};

export default function HowItWorksRoute() {
  return <HowItWorksPage />;
}
