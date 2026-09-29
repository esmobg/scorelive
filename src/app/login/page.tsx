import { Suspense } from "react";
import { LoginPage } from "@/components/pages/login-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-10">
          <p role="status">…</p>
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
