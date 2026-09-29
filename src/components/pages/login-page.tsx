"use client";

import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/i18n/locale-provider";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadLocalFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const { t } = useLocale();
  const { refresh } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          favorites: loadLocalFavorites(),
        }),
      });
      if (!res.ok) {
        setError(t("login.error"));
        setPending(false);
        return;
      }
      await refresh();
      const next = searchParams.get("next") || "/organize";
      router.replace(next.startsWith("/") ? next : "/organize");
    } catch {
      setError(t("login.error"));
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]">
          {t("login.title")}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">{t("login.lead")}</p>
      </header>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-5 rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)] p-5 sm:p-6"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-user`}>{t("login.username")}</Label>
          <Input
            id={`${formId}-user`}
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-required="true"
            className="min-h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-pass`}>{t("login.password")}</Label>
          <Input
            id={`${formId}-pass`}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            className="min-h-11"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm font-medium text-[var(--tf-danger)]">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="min-h-11 w-full" disabled={pending}>
          {pending ? t("login.loading") : t("login.submit")}
        </Button>
      </form>
    </div>
  );
}
