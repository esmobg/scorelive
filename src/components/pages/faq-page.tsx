"use client";

import { FaqList } from "@/components/faq/faq-list";
import { useLocale } from "@/i18n/locale-provider";

export function FaqPage() {
  const { t } = useLocale();

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {t("faq.title")}
        </h1>
        <p className="text-lg text-[var(--tf-ink-muted)]">{t("faq.lead")}</p>
      </header>
      <FaqList />
    </article>
  );
}
