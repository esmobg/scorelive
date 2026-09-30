"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetErrorCode =
  | "invalid_token"
  | "invalid_password"
  | "password_mismatch"
  | "generic";

export function ResetPasswordPage() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const formId = useId();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  function messageFor(code: ResetErrorCode): string {
    switch (code) {
      case "invalid_token":
        return t("reset.errorToken");
      case "invalid_password":
        return t("reset.errorPassword");
      case "password_mismatch":
        return t("reset.errorMismatch");
      case "generic":
        return t("reset.error");
      default: {
        const _exhaustive: never = code;
        return _exhaustive;
      }
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    if (password !== confirmPassword) {
      setError(messageFor("password_mismatch"));
      setPending(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        const code = data.error;
        if (
          code === "invalid_token" ||
          code === "invalid_password" ||
          code === "password_mismatch"
        ) {
          setError(messageFor(code));
        } else {
          setError(messageFor("generic"));
        }
        setPending(false);
        return;
      }
      setDone(true);
      setPending(false);
    } catch {
      setError(messageFor("generic"));
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]">
          {t("reset.title")}
        </h1>
        <p role="alert" className="text-[var(--tf-danger)]">
          {t("reset.errorToken")}
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2"
        >
          {t("forgot.title")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]">
          {t("reset.title")}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">{t("reset.lead")}</p>
      </header>

      {done ? (
        <div
          role="status"
          className="space-y-4 rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)] p-5 sm:p-6"
        >
          <p className="leading-relaxed text-[var(--tf-ink)]">
            {t("reset.success")}
          </p>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            {t("nav.login")}
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-5 rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)] p-5 sm:p-6"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-pass`}>{t("reset.password")}</Label>
            <Input
              id={`${formId}-pass`}
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              aria-describedby={`${formId}-pass-help`}
              className="min-h-11"
            />
            <p
              id={`${formId}-pass-help`}
              className="text-xs text-[var(--tf-ink-muted)]"
            >
              {t("reset.passwordHelp")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-confirm`}>
              {t("reset.confirmPassword")}
            </Label>
            <Input
              id={`${formId}-confirm`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-required="true"
              className="min-h-11"
            />
          </div>
          <p
            role="alert"
            aria-live="assertive"
            className="min-h-5 text-sm font-medium text-[var(--tf-danger)]"
          >
            {error}
          </p>
          <Button type="submit" className="min-h-11 w-full" disabled={pending}>
            {pending ? t("reset.loading") : t("reset.submit")}
          </Button>
        </form>
      )}
    </div>
  );
}
