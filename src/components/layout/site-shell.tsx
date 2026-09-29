"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { useLocale } from "@/i18n/locale-provider";
import type { Locale } from "@/i18n";
import { useAuth } from "@/lib/auth/auth-provider";
import { socialLinks } from "@/lib/social";

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();
  const { authenticated, logout, ready } = useAuth();

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/favorites", label: t("nav.favorites") },
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
            <ul className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--tf-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] sm:px-3"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                {ready && authenticated ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--tf-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] sm:px-3"
                    onClick={() => void logout()}
                  >
                    {t("nav.logout")}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--tf-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] sm:px-3"
                  >
                    {t("nav.login")}
                  </Link>
                )}
              </li>
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

  const footerLinks = [
    { href: "/about", label: t("nav.about") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/accessibility", label: t("nav.accessibility") },
  ] as const;

  return (
    <footer className="mt-auto border-t border-[var(--tf-line)] bg-[var(--tf-foam)]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-md text-sm text-[var(--tf-ink-muted)]">
            {t("brand.tagline")}
          </p>
          <nav aria-label={t("nav.footer")}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <nav aria-label={t("nav.social")}>
          <ul className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--tf-ink)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
