"use client";

import type { Group, Match, Team } from "@/lib/tournament";
import { localizeMatchLabel } from "@/lib/tournament";
import { Badge } from "@/components/ui/badge";
import { TeamBadge, findTeam } from "@/components/tournament/team-badge";
import { useLocale } from "@/i18n/locale-provider";

interface MatchListProps {
  matches: Match[];
  teams: Team[];
  groups?: Group[];
  emptyMessage?: string;
}

export function MatchList({
  matches,
  teams,
  groups = [],
  emptyMessage,
}: MatchListProps) {
  const { t } = useLocale();
  const empty = emptyMessage ?? t("matches.empty");

  if (matches.length === 0) {
    return <p className="text-[var(--tf-ink-muted)]">{empty}</p>;
  }

  const sorted = [...matches].sort((a, b) => {
    if (a.stage !== b.stage) {
      return a.stage === "group" ? -1 : 1;
    }
    return a.round - b.round || a.label.localeCompare(b.label);
  });

  const knockoutByRound = new Map<number, number>();
  for (const match of matches.filter((m) => m.stage === "knockout")) {
    knockoutByRound.set(
      match.round,
      (knockoutByRound.get(match.round) ?? 0) + 1,
    );
  }

  return (
    <ul className="space-y-2" aria-label={t("matches.listLabel")}>
      {sorted.map((match) => {
        const status =
          match.homeScore !== null && match.awayScore !== null
            ? { text: t("matches.statusPlayed"), done: true }
            : !match.homeTeamId || !match.awayTeamId
              ? { text: t("matches.statusPending"), done: false }
              : { text: t("matches.statusUpcoming"), done: false };

        const home = findTeam(teams, match.homeTeamId);
        const away = findTeam(teams, match.awayTeamId);
        const teamsInRound =
          match.stage === "knockout"
            ? (knockoutByRound.get(match.round) ?? 0) * 2
            : undefined;
        const label = localizeMatchLabel(match, groups, t, teamsInRound);

        return (
          <li
            key={match.id}
            className="flex flex-col gap-3 rounded-md border border-[var(--tf-line)] bg-[var(--tf-foam)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--tf-ink-muted)]">
                {label}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-base text-[var(--tf-ink)]">
                {home ? (
                  <TeamBadge team={home} compact />
                ) : (
                  <span className="font-medium">{t("matches.waiting")}</span>
                )}
                <span className="mx-1 tabular-nums font-semibold text-[var(--tf-accent-deep)]">
                  {match.homeScore !== null && match.awayScore !== null
                    ? `${match.homeScore} : ${match.awayScore}`
                    : "– : –"}
                </span>
                {away ? (
                  <TeamBadge team={away} compact />
                ) : (
                  <span className="font-medium">{t("matches.waiting")}</span>
                )}
              </div>
            </div>
            <Badge
              variant={status.done ? "default" : "secondary"}
              className="w-fit"
            >
              {status.text}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
