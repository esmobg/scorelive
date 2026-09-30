import { ForgotPasswordPage } from "@/components/pages/forgot-password-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Забравена парола",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
