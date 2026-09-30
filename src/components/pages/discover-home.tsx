"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { FaqList } from "@/components/faq/faq-list";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocale } from "@/i18n/locale-provider";

export function DiscoverHome() {
  const { tournaments, ready, reset } = useTournamentStore();
  const { t } = useLocale();

  const howSteps = [
    {
      title: t("home.howStep1Title"),
      body: t("home.howStep1Body"),
    },
    {
      title: t("home.howStep2Title"),
      body: t("home.howStep2Body"),
    },
    {
      title: t("home.howStep3Title"),
      body: t("home.howStep3Body"),
    },
  ] as const;

  return (
    <div className="space-y-16 pb-16">
      <section
        className="hero-panel relative overflow-hidden px-4 py-10 sm:px-6 sm:py-24"
        aria-labelledby="hero-heading"
      >
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
          <div className="motion-safe:animate-[mark-rise_0.9s_ease_both]">
            <BrandMark markAlt={t("brand.markAlt")} size="lg" />
          </div>
          <h1
            id="hero-heading"
            className="max-w-xl text-xl font-semibold leading-snug text-[var(--tf-ink)] sm:text-3xl motion-safe:animate-fade-up motion-safe:[animation-delay:80ms]"
          >
            {t("home.heroTitle")}
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-[var(--tf-ink-muted)] motion-safe:animate-fade-up motion-safe:[animation-delay:140ms]">
            {t("home.heroLead")}
          </p>
          <div className="flex flex-wrap gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:200ms]">
            <Link
              href="/organize"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
            >
              {t("home.ctaOrganize")}
            </Link>
            <a
              href="#tournaments"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-[var(--tf-foam)]/80 px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
            >
              {t("home.ctaFollow")}
            </a>
          </div>
        </div>
      </section>

      <section
        id="tournaments"
        className="mx-auto w-full max-w-6xl px-4 sm:px-6"
        aria-labelledby="tournaments-heading"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="tournaments-heading"
              className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]"
            >
              {t("home.tournamentsHeading")}
            </h2>
            <p className="mt-1 text-[var(--tf-ink-muted)]">
              {t("home.tournamentsLead")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            onClick={() => reset()}
          >
            {t("home.resetDemo")}
          </Button>
        </div>

        {!ready ? (
          <p role="status" className="text-[var(--tf-ink-muted)]">
            {t("home.loading")}
          </p>
        ) : tournaments.length === 0 ? (
          <Alert>
            <AlertTitle>{t("home.emptyTitle")}</AlertTitle>
            <AlertDescription>{t("home.emptyBody")}</AlertDescription>
          </Alert>
        ) : (
          <div className="divide-y-0 rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)]/80 px-4 sm:px-6">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </section>

      <section
        className="mx-auto w-full max-w-6xl px-4 sm:px-6"
        aria-labelledby="how-heading"
      >
        <div className="mb-8 max-w-2xl space-y-2">
          <h2
            id="how-heading"
            className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]"
          >
            {t("home.howHeading")}
          </h2>
          <p className="text-[var(--tf-ink-muted)]">{t("home.howLead")}</p>
        </div>
        <ol className="grid gap-8 sm:grid-cols-3">
          {howSteps.map((step, index) => (
            <li key={step.title} className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--tf-accent-deep)]">
                {index + 1}
              </p>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--tf-ink)]">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--tf-ink-muted)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-8">
          <Link
            href="/how-it-works"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            {t("home.howCta")}
          </Link>
        </p>
      </section>

      <section
        id="faq"
        className="mx-auto w-full max-w-3xl px-4 sm:px-6"
        aria-labelledby="faq-heading"
      >
        <div className="mb-8 max-w-2xl space-y-2">
          <h2
            id="faq-heading"
            className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]"
          >
            {t("faq.title")}
          </h2>
          <p className="text-[var(--tf-ink-muted)]">{t("faq.lead")}</p>
        </div>
        <FaqList />
      </section>

      <section
        className="border-y border-[var(--tf-line)] bg-[var(--tf-foam)]/60"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-xl space-y-2">
            <h2
              id="cta-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--tf-ink)] sm:text-3xl"
            >
              {t("home.ctaSectionHeading")}
            </h2>
            <p className="text-[var(--tf-ink-muted)]">
              {t("home.ctaSectionLead")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/organize"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
            >
              {t("home.ctaSectionOrganize")}
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
            >
              {t("home.ctaSectionAbout")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
