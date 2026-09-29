"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { computeStandings } from "@/lib/tournament";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import { StandingsTable } from "@/components/tournament/standings-table";
import { BracketView } from "@/components/tournament/bracket-view";
import { MatchList } from "@/components/tournament/match-list";
import { formatLabels } from "@/components/tournament/tournament-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PublicTournamentPage() {
  const params = useParams<{ id: string }>();
  const { getById, ready } = useTournamentStore();
  const tournament = getById(params.id);

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
      tournament.teams.map((t) => t.id),
      groupMatches,
    );
  }, [tournament]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p role="status">Зареждане на турнира…</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <Alert>
          <AlertTitle>Турнирът не е намерен</AlertTitle>
          <AlertDescription>
            Демо данните може да са изчистени. Върнете се към началото.
          </AlertDescription>
        </Alert>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          Към началото
        </Link>
      </div>
    );
  }

  const hasStandings =
    groupStandings.length > 0 || overallGroupStandings !== null;
  const hasBracket = tournament.matches.some((m) => m.stage === "knockout");

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
          {formatLabels[tournament.format]} · {tournament.startDate} —{" "}
          {tournament.endDate} · {tournament.teams.length} участници
        </p>
        <p>
          <Link
            href={`/organize/${tournament.id}`}
            className="text-sm font-medium underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            Редактирай като организатор
          </Link>
        </p>
      </header>

      <Tabs
        defaultValue={
          hasStandings ? "standings" : hasBracket ? "bracket" : "matches"
        }
      >
        <TabsList aria-label="Изгледи на турнира">
          {hasStandings ? (
            <TabsTrigger value="standings">Класиране</TabsTrigger>
          ) : null}
          {hasBracket ? (
            <TabsTrigger value="bracket">Схема</TabsTrigger>
          ) : null}
          <TabsTrigger value="matches">Мачове</TabsTrigger>
        </TabsList>

        {hasStandings ? (
          <TabsContent value="standings" className="space-y-8 pt-4">
            {groupStandings.map(({ group, standings }) => (
              <StandingsTable
                key={group.id}
                title={group.name}
                standings={standings}
                teams={tournament.teams}
              />
            ))}
            {overallGroupStandings ? (
              <StandingsTable
                title="Класиране"
                standings={overallGroupStandings}
                teams={tournament.teams}
              />
            ) : null}
          </TabsContent>
        ) : null}

        {hasBracket ? (
          <TabsContent value="bracket" className="pt-4">
            <BracketView
              matches={tournament.matches}
              teams={tournament.teams}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="matches" className="pt-4">
          <section aria-labelledby="matches-heading" className="space-y-3">
            <h2 id="matches-heading" className="section-title">
              Мачове
            </h2>
            <MatchList
              matches={tournament.matches}
              teams={tournament.teams}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
