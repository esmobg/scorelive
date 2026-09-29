"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadLocalFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterErrorCode =
  | "invalid_username"
  | "invalid_password"
  | "password_mismatch"
  | "username_taken"
  | "generic";

export function RegisterPage() {
  const { t } = useLocale();
  const { refresh } = useAuth();
  const formId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function messageFor(code: RegisterErrorCode): string {
    switch (code) {
      case "invalid_username":
        return t("register.errorUsername");
      case "invalid_password":
        return t("register.errorPassword");
      case "password_mismatch":
        return t("register.errorMismatch");
      case "username_taken":
        return t("register.errorTaken");
      case "generic":
        return t("register.error");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
          favorites: loadLocalFavorites(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        const code = data.error;
        if (
          code === "invalid_username" ||
          code === "invalid_password" ||
          code === "password_mismatch" ||
          code === "username_taken"
        ) {
          setError(messageFor(code));
        } else {
          setError(messageFor("generic"));
        }
        setPending(false);
        return;
      }
      await refresh();
      window.location.assign("/organize");
    } catch {
      setError(messageFor("generic"));
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]">
          {t("register.title")}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">{t("register.lead")}</p>
      </header>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-5 rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)] p-5 sm:p-6"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-user`}>{t("register.username")}</Label>
          <Input
            id={`${formId}-user`}
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-required="true"
            aria-describedby={`${formId}-user-help`}
            className="min-h-11"
          />
          <p
            id={`${formId}-user-help`}
            className="text-xs text-[var(--tf-ink-muted)]"
          >
            {t("register.usernameHelp")}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-pass`}>{t("register.password")}</Label>
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
            {t("register.passwordHelp")}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-confirm`}>
            {t("register.confirmPassword")}
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
          {pending ? t("register.loading") : t("register.submit")}
        </Button>
      </form>

      <p className="text-sm text-[var(--tf-ink-muted)]">
        {t("register.haveAccount")}{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("nav.login")}
        </Link>
      </p>
    </div>
  );
}
