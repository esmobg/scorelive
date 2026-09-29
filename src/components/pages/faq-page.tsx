"use client";

import { useLocale } from "@/i18n/locale-provider";

export function FaqPage() {
  const { t } = useLocale();

  const items = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ] as const;

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {t("faq.title")}
        </h1>
        <p className="text-lg text-[var(--tf-ink-muted)]">{t("faq.lead")}</p>
      </header>
      <div className="space-y-4">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)]/80 p-4"
          >
            <summary className="cursor-pointer list-none font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--tf-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="mt-3 leading-relaxed text-[var(--tf-ink-muted)]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </article>
  );
}
