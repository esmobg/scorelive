import { Suspense } from "react";
import { RegisterPage } from "@/components/pages/register-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация",
  robots: { index: false, follow: false },
};

export default function RegisterRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-10">
          <p role="status">…</p>
        </div>
      }
    >
      <RegisterPage />
    </Suspense>
  );
}
