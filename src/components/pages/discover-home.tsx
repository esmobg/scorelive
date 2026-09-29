"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocale } from "@/i18n/locale-provider";

export function DiscoverHome() {
  const { tournaments, ready, reset } = useTournamentStore();
  const { t } = useLocale();

  return (
    <div className="space-y-16">
      <section
        className="hero-panel relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
        aria-labelledby="hero-heading"
      >
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
          <div className="motion-safe:animate-[mark-rise_0.9s_ease_both]">
            <BrandMark markAlt={t("brand.markAlt")} size="lg" />
          </div>
          <h1
            id="hero-heading"
            className="max-w-xl text-2xl font-semibold leading-snug text-[var(--tf-ink)] sm:text-3xl motion-safe:animate-fade-up motion-safe:[animation-delay:80ms]"
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
          <Button type="button" variant="ghost" className="min-h-11" onClick={() => reset()}>
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
    </div>
  );
}
