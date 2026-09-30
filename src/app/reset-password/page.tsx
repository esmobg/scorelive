import { Suspense } from "react";
import { ResetPasswordPage } from "@/components/pages/reset-password-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нова парола",
  robots: { index: false, follow: false },
};

export default function ResetPasswordRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-10">
          <p role="status">…</p>
        </div>
      }
    >
      <ResetPasswordPage />
    </Suspense>
  );
}
