"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale-provider";

export function HowItWorksPage() {
  const { t } = useLocale();

  const steps = [
    { title: t("how.step1Title"), body: t("how.step1Body") },
    { title: t("how.step2Title"), body: t("how.step2Body") },
    { title: t("how.step3Title"), body: t("how.step3Body") },
    { title: t("how.step4Title"), body: t("how.step4Body") },
  ] as const;

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {t("how.title")}
        </h1>
        <p className="text-lg text-[var(--tf-ink-muted)]">{t("how.lead")}</p>
      </header>
      <ol className="space-y-6">
        {steps.map((step) => (
          <li key={step.title} className="space-y-2">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--tf-ink)]">
              {step.title}
            </h2>
            <p className="leading-relaxed text-[var(--tf-ink-muted)]">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
      <p>
        <Link
          href="/organize"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("how.cta")}
        </Link>
      </p>
    </article>
  );
}
