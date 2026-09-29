"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { useLocale } from "@/i18n/locale-provider";
import type { Locale } from "@/i18n";

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/organize", label: t("nav.organize") },
  ] as const;

  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          aria-label={t("brand.name")}
        >
          <BrandMark markAlt={t("brand.markAlt")} size="sm" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleToggle
            locale={locale}
            onChange={setLocale}
            labelBg={t("locale.bg")}
            labelEn={t("locale.en")}
            groupLabel={t("locale.label")}
          />
          <nav aria-label={t("nav.main")}>
            <ul className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[var(--tf-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

function LocaleToggle({
  locale,
  onChange,
  labelBg,
  labelEn,
  groupLabel,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  labelBg: string;
  labelEn: string;
  groupLabel: string;
}) {
  return (
    <div className="locale-toggle" role="group" aria-label={groupLabel}>
      <button
        type="button"
        aria-pressed={locale === "bg"}
        onClick={() => onChange("bg")}
      >
        <span className="sr-only">{labelBg}</span>
        <span aria-hidden="true">BG</span>
      </button>
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => onChange("en")}
      >
        <span className="sr-only">{labelEn}</span>
        <span aria-hidden="true">EN</span>
      </button>
    </div>
  );
}

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="mt-auto border-t border-[var(--tf-line)] bg-[var(--tf-foam)]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-[var(--tf-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t("brand.tagline")}</p>
        <p>
          <a
            href="/accessibility"
            className="inline-flex min-h-11 items-center underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            {t("nav.accessibility")}
          </a>
        </p>
      </div>
    </footer>
  );
}
