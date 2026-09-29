"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  addTeam,
  generateFixtures,
  removeTeam,
  setMatchScore,
} from "@/lib/tournament";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import { LiveScoreRegion } from "@/components/a11y/live-score-region";
import { ScoreEntryForm } from "@/components/tournament/score-entry-form";
import { MatchList } from "@/components/tournament/match-list";
import { formatLabels } from "@/components/tournament/tournament-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OrganizeManagePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { getById, save, ready } = useTournamentStore();
  const tournament = getById(id);
  const [teamName, setTeamName] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [formError, setFormError] = useState("");

  const pendingMatches = useMemo(() => {
    if (!tournament) return [];
    return tournament.matches.filter(
      (m) =>
        m.homeTeamId &&
        m.awayTeamId &&
        (m.homeScore === null || m.awayScore === null),
    );
  }, [tournament]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p role="status">Зареждане…</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <Alert>
          <AlertTitle>Турнирът не е намерен</AlertTitle>
          <AlertDescription>
            Проверете адреса или създайте нов турнир.
          </AlertDescription>
        </Alert>
        <Link
          href="/organize"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          Към организиране
        </Link>
      </div>
    );
  }

  function handleAddTeam(event: React.FormEvent) {
    event.preventDefault();
    if (!teamName.trim()) {
      setFormError("Въведете име на отбор.");
      return;
    }
    setFormError("");
    save(addTeam(tournament!, teamName));
    setTeamName("");
  }

  function handleGenerate() {
    if (tournament!.teams.length < 2) {
      setFormError("Добавете поне два отбора преди генериране.");
      return;
    }
    setFormError("");
    save(generateFixtures(tournament!));
    setLiveMessage("Програмата с мачове е генерирана.");
  }

  function handleScore(matchId: string, homeScore: number, awayScore: number) {
    const match = tournament!.matches.find((m) => m.id === matchId);
    const next = setMatchScore(tournament!, matchId, homeScore, awayScore);
    save(next);
    const home =
      tournament!.teams.find((t) => t.id === match?.homeTeamId)?.name ?? "";
    const away =
      tournament!.teams.find((t) => t.id === match?.awayTeamId)?.name ?? "";
    setLiveMessage(`Резултатът е обновен: ${home} ${homeScore} : ${awayScore} ${away}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <LiveScoreRegion message={liveMessage} />

      <header className="space-y-2">
        <p className="text-sm font-medium text-[var(--tf-ink-muted)]">
          {tournament.sport} · {formatLabels[tournament.format]}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {tournament.name}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">
          {tournament.startDate} — {tournament.endDate}
        </p>
        <p>
          <Link
            href={`/tournaments/${tournament.id}`}
            className="font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            Публична страница за следене
          </Link>
        </p>
      </header>

      <Tabs defaultValue="teams">
        <TabsList aria-label="Секции за управление">
          <TabsTrigger value="teams">Отбори</TabsTrigger>
          <TabsTrigger value="fixtures">Програма</TabsTrigger>
          <TabsTrigger value="scores">Резултати</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4 pt-4">
          <form
            onSubmit={handleAddTeam}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="team-name">Нов отбор / участник</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="min-h-11">
              Добави
            </Button>
          </form>
          {formError ? (
            <p role="alert" className="text-sm font-medium text-[var(--tf-danger)]">
              {formError}
            </p>
          ) : null}
          {tournament.teams.length === 0 ? (
            <p className="text-[var(--tf-ink-muted)]">Все още няма отбори.</p>
          ) : (
            <ul className="divide-y divide-[var(--tf-line)] rounded-lg border border-[var(--tf-line)] bg-[var(--tf-foam)]">
              {tournament.teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="font-medium">{team.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => save(removeTeam(tournament, team.id))}
                  >
                    Премахни
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            onClick={handleGenerate}
            className="min-h-11"
          >
            Генерирай мачове
          </Button>
        </TabsContent>

        <TabsContent value="fixtures" className="space-y-4 pt-4">
          <MatchList
            matches={tournament.matches}
            teams={tournament.teams}
            emptyMessage="Няма програма. Добавете отбори и генерирайте мачове."
          />
        </TabsContent>

        <TabsContent value="scores" className="space-y-4 pt-4">
          {pendingMatches.length === 0 ? (
            <p className="text-[var(--tf-ink-muted)]">
              {tournament.matches.length === 0
                ? "Първо генерирайте програма."
                : "Всички налични мачове имат резултат. Можете да редактирате по-долу."}
            </p>
          ) : null}
          <div className="space-y-4">
            {(pendingMatches.length > 0
              ? pendingMatches
              : tournament.matches.filter((m) => m.homeTeamId && m.awayTeamId)
            ).map((match) => (
              <ScoreEntryForm
                key={`${match.id}-${match.homeScore}-${match.awayScore}`}
                match={match}
                teams={tournament.teams}
                onSave={handleScore}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
