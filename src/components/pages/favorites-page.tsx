"use client";

import Link from "next/link";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import { useFavorites } from "@/lib/favorites-provider";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocale } from "@/i18n/locale-provider";

export function FavoritesPage() {
  const { tournaments, ready: storeReady } = useTournamentStore();
  const { ids, ready: favReady } = useFavorites();
  const { t } = useLocale();

  const ready = storeReady && favReady;
  const favoriteTournaments = tournaments.filter((tournament) =>
    ids.includes(tournament.id),
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {t("favorites.title")}
        </h1>
        <p className="max-w-2xl text-[var(--tf-ink-muted)]">
          {t("favorites.lead")}
        </p>
      </header>

      {!ready ? (
        <p role="status">{t("favorites.loading")}</p>
      ) : favoriteTournaments.length === 0 ? (
        <Alert>
          <AlertTitle>{t("favorites.emptyTitle")}</AlertTitle>
          <AlertDescription>{t("favorites.emptyBody")}</AlertDescription>
          <p className="mt-3">
            <Link
              href="/#tournaments"
              className="inline-flex min-h-11 items-center font-medium underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
            >
              {t("favorites.browse")}
            </Link>
          </p>
        </Alert>
      ) : (
        <div className="rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)]/80 px-4 sm:px-6">
          {favoriteTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
