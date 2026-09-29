"use client";

import { useId, useState } from "react";
import type { Group, Match, Team } from "@/lib/tournament";
import { localizeMatchLabel } from "@/lib/tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamBadge, findTeam } from "@/components/tournament/team-badge";
import { useLocale } from "@/i18n/locale-provider";

interface ScoreEntryFormProps {
  match: Match;
  teams: Team[];
  groups?: Group[];
  onSave: (
    matchId: string,
    homeScore: number,
    awayScore: number,
  ) => void;
}

export function ScoreEntryForm({
  match,
  teams,
  groups = [],
  onSave,
}: ScoreEntryFormProps) {
  const { t } = useLocale();
  const formId = useId();
  const [home, setHome] = useState(
    match.homeScore !== null ? String(match.homeScore) : "",
  );
  const [away, setAway] = useState(
    match.awayScore !== null ? String(match.awayScore) : "",
  );
  const [error, setError] = useState("");

  const ready = Boolean(match.homeTeamId && match.awayTeamId);
  const homeTeam = findTeam(teams, match.homeTeamId);
  const awayTeam = findTeam(teams, match.awayTeamId);
  const homeName = homeTeam?.name ?? t("matches.waiting");
  const awayName = awayTeam?.name ?? t("matches.waiting");
  const label = localizeMatchLabel(match, groups, t);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) {
      setError(t("score.errorNoTeams"));
      return;
    }
    const homeScore = Number(home);
    const awayScore = Number(away);
    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      setError(t("score.errorNumbers"));
      return;
    }
    if (match.stage === "knockout" && homeScore === awayScore) {
      setError(t("score.errorDraw"));
      return;
    }
    setError("");
    onSave(match.id, homeScore, awayScore);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-md border border-[var(--tf-line)] bg-[var(--tf-foam)] p-4"
      aria-describedby={error ? `${formId}-error` : undefined}
    >
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--tf-ink-muted)]">
          {label}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {homeTeam ? <TeamBadge team={homeTeam} compact /> : homeName}
          <span className="text-[var(--tf-ink-muted)]">—</span>
          {awayTeam ? <TeamBadge team={awayTeam} compact /> : awayName}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-home`}>
            {t("score.home", { team: homeName })}
          </Label>
          <Input
            id={`${formId}-home`}
            inputMode="numeric"
            pattern="[0-9]*"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={!ready}
            required
            aria-required="true"
            className="min-h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-away`}>
            {t("score.away", { team: awayName })}
          </Label>
          <Input
            id={`${formId}-away`}
            inputMode="numeric"
            pattern="[0-9]*"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            disabled={!ready}
            required
            aria-required="true"
            className="min-h-11"
          />
        </div>
      </div>

      {error ? (
        <p
          id={`${formId}-error`}
          role="alert"
          className="text-sm font-medium text-[var(--tf-danger)]"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={!ready} className="min-h-11">
        {t("score.save")}
      </Button>
    </form>
  );
}
