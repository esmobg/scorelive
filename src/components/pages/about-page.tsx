"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale-provider";

export function AboutPage() {
  const { t } = useLocale();

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {t("about.title")}
        </h1>
        <p className="text-lg text-[var(--tf-ink-muted)]">{t("about.lead")}</p>
      </header>
      <p className="leading-relaxed text-[var(--tf-ink)]">{t("about.body1")}</p>
      <p className="leading-relaxed text-[var(--tf-ink)]">{t("about.body2")}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/organize"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("about.ctaOrganize")}
        </Link>
        <Link
          href="/accessibility"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("about.ctaA11y")}
        </Link>
      </div>
    </article>
  );
}
