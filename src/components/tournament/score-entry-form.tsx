"use client";

import { useId, useState } from "react";
import type { Match, Team } from "@/lib/tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScoreEntryFormProps {
  match: Match;
  teams: Team[];
  onSave: (
    matchId: string,
    homeScore: number,
    awayScore: number,
  ) => void;
}

function teamName(teams: Team[], id: string | null): string {
  if (!id) return "Чака се";
  return teams.find((t) => t.id === id)?.name ?? "—";
}

export function ScoreEntryForm({ match, teams, onSave }: ScoreEntryFormProps) {
  const formId = useId();
  const [home, setHome] = useState(
    match.homeScore !== null ? String(match.homeScore) : "",
  );
  const [away, setAway] = useState(
    match.awayScore !== null ? String(match.awayScore) : "",
  );
  const [error, setError] = useState("");

  const ready = Boolean(match.homeTeamId && match.awayTeamId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) {
      setError("Мачът още няма двата отбора.");
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
      setError("Въведете цели неотрицателни числа за резултата.");
      return;
    }
    if (match.stage === "knockout" && homeScore === awayScore) {
      setError("В елиминациите трябва да има победител (без равенство).");
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
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--tf-ink-muted)]">
          {match.label}
        </p>
        <p className="font-medium text-[var(--tf-ink)]">
          {teamName(teams, match.homeTeamId)} —{" "}
          {teamName(teams, match.awayTeamId)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-home`}>
            Гостоприемник ({teamName(teams, match.homeTeamId)})
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
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-away`}>
            Гост ({teamName(teams, match.awayTeamId)})
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

      <Button type="submit" disabled={!ready}>
        Запази резултат
      </Button>
    </form>
  );
}
