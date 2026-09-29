"use client";

import { useLocale } from "@/i18n/locale-provider";

export default function AccessibilityPage() {
  const { t } = useLocale();

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]">
        {t("a11y.title")}
      </h1>
      <p className="text-[var(--tf-ink-muted)]">{t("a11y.intro")}</p>
      <ul className="list-disc space-y-2 pl-5 text-[var(--tf-ink)]">
        <li>{t("a11y.item.skip")}</li>
        <li>{t("a11y.item.landmarks")}</li>
        <li>{t("a11y.item.contrast")}</li>
        <li>{t("a11y.item.live")}</li>
        <li>{t("a11y.item.motion")}</li>
        <li>{t("a11y.item.locale")}</li>
        <li>{t("a11y.item.identity")}</li>
      </ul>
    </article>
  );
}
