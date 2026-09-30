"use client";

import { useLocale } from "@/i18n/locale-provider";

export function PrivacyPage() {
  const { t } = useLocale();

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {t("privacy.title")}
        </h1>
        <p className="text-lg text-[var(--tf-ink-muted)]">{t("privacy.lead")}</p>
        <p className="rounded-lg border border-[var(--tf-line)] bg-[var(--tf-mist)]/40 px-4 py-3 text-sm text-[var(--tf-ink-muted)]">
          {t("privacy.reviewNote")}
        </p>
      </header>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--tf-ink)]">
          {t("privacy.s1Title")}
        </h2>
        <p className="leading-relaxed text-[var(--tf-ink)]">{t("privacy.s1Body")}</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--tf-ink)]">
          {t("privacy.s2Title")}
        </h2>
        <p className="leading-relaxed text-[var(--tf-ink)]">{t("privacy.s2Body")}</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--tf-ink)]">
          {t("privacy.s3Title")}
        </h2>
        <p className="leading-relaxed text-[var(--tf-ink)]">{t("privacy.s3Body")}</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--tf-ink)]">
          {t("privacy.s4Title")}
        </h2>
        <p className="leading-relaxed text-[var(--tf-ink)]">{t("privacy.s4Body")}</p>
      </section>
    </article>
  );
}
