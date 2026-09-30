import { TermsPage } from "@/components/pages/terms-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия",
  description:
    "Условия за ползване на ScoreLive — отворена регистрация, без плащания.",
  openGraph: {
    title: "Условия — ScoreLive",
    description:
      "Правила за организатори и фенове. Без плащания и OAuth в тази версия.",
  },
};

export default function TermsRoute() {
  return <TermsPage />;
}
