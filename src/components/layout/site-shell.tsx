"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { useLocale } from "@/i18n/locale-provider";
import type { Locale } from "@/i18n";
import { useAuth } from "@/lib/auth/auth-provider";
import { useTheme } from "@/lib/theme/theme-provider";
import { socialLinks } from "@/lib/social";

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();
  const { authenticated, logout, ready } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/favorites", label: t("nav.favorites") },
    { href: "/organize", label: t("nav.organize") },
  ] as const;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="min-h-11 min-w-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          aria-label={t("brand.name")}
          onClick={closeMenu}
        >
          <BrandMark markAlt={t("brand.markAlt")} size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleToggle
            locale={locale}
            onChange={setLocale}
            labelBg={t("locale.bg")}
            labelEn={t("locale.en")}
            groupLabel={t("locale.label")}
          />
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? t("theme.toggleToLight") : t("theme.toggleToDark")
            }
            aria-pressed={theme === "dark"}
            title={theme === "dark" ? t("theme.light") : t("theme.dark")}
          >
            <span aria-hidden="true" className="text-xs font-semibold tracking-wide">
              {theme === "dark" ? t("theme.light") : t("theme.dark")}
            </span>
          </button>
          <nav
            aria-label={t("nav.main")}
            className="hidden items-center md:flex"
          >
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
                  <span className="inline-flex items-center gap-1">
                    <Link
                      href="/login"
                      className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--tf-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] sm:px-3"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--tf-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] sm:px-3"
                    >
                      {t("nav.register")}
                    </Link>
                  </span>
                )}
              </li>
            </ul>
          </nav>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--tf-line)] bg-[var(--tf-foam)] text-[var(--tf-ink)] md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
            </span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id={menuId}
          className="border-t border-[var(--tf-line)] bg-[var(--tf-foam)] md:hidden"
        >
          <nav aria-label={t("nav.main")} className="mx-auto max-w-6xl px-4 py-3">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-base font-medium text-[var(--tf-ink)] hover:bg-[var(--tf-mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                {ready && authenticated ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-base font-medium text-[var(--tf-ink)] hover:bg-[var(--tf-mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                    onClick={() => {
                      closeMenu();
                      void logout();
                    }}
                  >
                    {t("nav.logout")}
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/login"
                      className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-base font-medium text-[var(--tf-ink)] hover:bg-[var(--tf-mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                      onClick={closeMenu}
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-base font-medium text-[var(--tf-ink)] hover:bg-[var(--tf-mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                      onClick={closeMenu}
                    >
                      {t("nav.register")}
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
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

function SocialIcon({ paths }: { paths: string[] }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function SiteFooter() {
  const { t } = useLocale();

  const footerLinks = [
    { href: "/about", label: t("nav.about") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
    { href: "/#faq", label: t("nav.faq") },
    { href: "/accessibility", label: t("nav.accessibility") },
    { href: "/privacy", label: t("nav.privacy") },
    { href: "/terms", label: t("nav.terms") },
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
          <ul className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--tf-line)] bg-[var(--tf-foam)] text-[var(--tf-ink)] hover:bg-[var(--tf-mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                >
                  <SocialIcon paths={link.paths} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
