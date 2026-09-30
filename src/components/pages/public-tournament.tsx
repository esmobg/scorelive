"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  computeStandings,
  computeSwissStandings,
  groupDisplayName,
} from "@/lib/tournament";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import { formatLabel } from "@/i18n";
import { useLocale } from "@/i18n/locale-provider";
import { StandingsTable } from "@/components/tournament/standings-table";
import { BracketView } from "@/components/tournament/bracket-view";
import { MatchList } from "@/components/tournament/match-list";
import { FavoriteToggle } from "@/components/tournament/favorite-toggle";
import { ShareTournament } from "@/components/tournament/share-tournament";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PublicTournamentPage() {
  const params = useParams<{ id: string }>();
  const { getById, ready } = useTournamentStore();
  const tournament = getById(params.id);
  const { t } = useLocale();
  const [tab, setTab] = useState<string | null>(null);

  const groupStandings = useMemo(() => {
    if (!tournament) return [];
    return tournament.groups.map((group) => ({
      group,
      standings: computeStandings(
        group.teamIds,
        tournament.matches.filter(
          (m) => m.stage === "group" && m.groupId === group.id,
        ),
      ),
    }));
  }, [tournament]);

  const overallGroupStandings = useMemo(() => {
    if (!tournament || tournament.groups.length > 0) return null;
    const groupMatches = tournament.matches.filter((m) => m.stage === "group");
    if (groupMatches.length === 0) return null;
    return computeStandings(
      tournament.teams.map((team) => team.id),
      groupMatches,
    );
  }, [tournament]);

  const swissStandings = useMemo(() => {
    if (!tournament || tournament.format !== "swiss") return null;
    return computeSwissStandings(
      tournament.teams.map((team) => team.id),
      tournament.matches.filter((m) => m.stage === "swiss"),
    );
  }, [tournament]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p role="status">{t("public.loading")}</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <Alert>
          <AlertTitle>{t("public.notFoundTitle")}</AlertTitle>
          <AlertDescription>{t("public.notFoundBody")}</AlertDescription>
        </Alert>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("public.backHome")}
        </Link>
      </div>
    );
  }

  const hasStandings =
    groupStandings.length > 0 ||
    overallGroupStandings !== null ||
    swissStandings !== null;
  const hasBracket = tournament.matches.some((m) => m.stage === "knockout");
  const defaultTab = hasStandings
    ? "standings"
    : hasBracket
      ? "bracket"
      : "matches";
  const activeTab = tab ?? defaultTab;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3 border-b border-[var(--tf-line)] pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--tf-ink-muted)]">
          {tournament.sport}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-5xl">
          {tournament.name}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">
          {t("public.meta", {
            format: formatLabel(tournament.format, t),
            start: tournament.startDate,
            end: tournament.endDate,
            count: tournament.teams.length,
          })}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <FavoriteToggle tournamentId={tournament.id} />
          <Link
            href={`/organize/${tournament.id}`}
            className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            {t("public.editAsOrganizer")}
          </Link>
        </div>
        <ShareTournament
          title={tournament.name}
          path={`/tournaments/${tournament.id}`}
        />
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (typeof value === "string") {
            setTab(value);
          }
        }}
      >
        <TabsList aria-label={t("public.viewsLabel")}>
          {hasStandings ? (
            <TabsTrigger value="standings">{t("public.tabStandings")}</TabsTrigger>
          ) : null}
          {hasBracket ? (
            <TabsTrigger value="bracket">{t("public.tabBracket")}</TabsTrigger>
          ) : null}
          <TabsTrigger value="matches">{t("public.tabMatches")}</TabsTrigger>
        </TabsList>

        {hasStandings ? (
          <TabsContent value="standings" className="space-y-8 pt-4">
            {groupStandings.map(({ group, standings }) => (
              <StandingsTable
                key={group.id}
                title={groupDisplayName(group.name, t)}
                standings={standings}
                teams={tournament.teams}
              />
            ))}
            {overallGroupStandings ? (
              <StandingsTable
                title={t("public.standingsHeading")}
                standings={overallGroupStandings}
                teams={tournament.teams}
              />
            ) : null}
            {swissStandings ? (
              <StandingsTable
                title={t("public.standingsHeading")}
                standings={swissStandings}
                teams={tournament.teams}
                showBuchholz
              />
            ) : null}
          </TabsContent>
        ) : null}

        {hasBracket ? (
          <TabsContent value="bracket" className="pt-4">
            <BracketView
              matches={tournament.matches}
              teams={tournament.teams}
              groups={tournament.groups}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="matches" className="pt-4">
          <section aria-labelledby="matches-heading" className="space-y-3">
            <h2 id="matches-heading" className="section-title">
              {t("public.matchesHeading")}
            </h2>
            <MatchList
              matches={tournament.matches}
              teams={tournament.teams}
              groups={tournament.groups}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
