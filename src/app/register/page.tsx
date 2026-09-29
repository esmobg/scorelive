import { RegisterPage } from "@/components/pages/register-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация",
  robots: { index: false, follow: false },
};

export default function RegisterRoute() {
  return <RegisterPage />;
}
