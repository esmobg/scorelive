"use client";

import { useLocale } from "@/i18n/locale-provider";

export function SkipLink() {
  const { t } = useLocale();
  return (
    <a
      href="#main-content"
      className="skip-link focus:bg-[var(--tf-ink)] focus:text-[var(--tf-foam)]"
    >
      {t("nav.skip")}
    </a>
  );
}
