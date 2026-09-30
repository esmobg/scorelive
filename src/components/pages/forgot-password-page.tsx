"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordPage() {
  const { t } = useLocale();
  const formId = useId();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (res.status === 429) {
        setError(t("forgot.error"));
        setPending(false);
        return;
      }
      // Always show generic success (including non-OK) to avoid enumeration.
      setDone(true);
      setPending(false);
    } catch {
      setError(t("forgot.error"));
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]">
          {t("forgot.title")}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">{t("forgot.lead")}</p>
      </header>

      {done ? (
        <div
          role="status"
          className="space-y-4 rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)] p-5 sm:p-6"
        >
          <p className="leading-relaxed text-[var(--tf-ink)]">
            {t("forgot.success")}
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
            <Label htmlFor={`${formId}-id`}>{t("forgot.identifier")}</Label>
            <Input
              id={`${formId}-id`}
              name="identifier"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              aria-required="true"
              aria-describedby={`${formId}-help`}
              className="min-h-11"
            />
            <p
              id={`${formId}-help`}
              className="text-xs text-[var(--tf-ink-muted)]"
            >
              {t("forgot.identifierHelp")}
            </p>
          </div>
          <p
            role="alert"
            aria-live="assertive"
            className="min-h-5 text-sm font-medium text-[var(--tf-danger)]"
          >
            {error}
          </p>
          <Button type="submit" className="min-h-11 w-full" disabled={pending}>
            {pending ? t("forgot.loading") : t("forgot.submit")}
          </Button>
        </form>
      )}

      <p className="text-sm text-[var(--tf-ink-muted)]">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("forgot.backLogin")}
        </Link>
      </p>
    </div>
  );
}
