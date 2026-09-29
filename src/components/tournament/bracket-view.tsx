"use client";

import type { Group, Match, Team } from "@/lib/tournament";
import { localizeMatchLabel } from "@/lib/tournament";
import { TeamBadge, findTeam } from "@/components/tournament/team-badge";
import { useLocale } from "@/i18n/locale-provider";

interface BracketViewProps {
  matches: Match[];
  teams: Team[];
  groups?: Group[];
}

export function BracketView({
  matches,
  teams,
  groups = [],
}: BracketViewProps) {
  const { t } = useLocale();
  const knockout = matches
    .filter((m) => m.stage === "knockout")
    .sort(
      (a, b) =>
        a.round - b.round || (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0),
    );

  if (knockout.length === 0) {
    return (
      <section aria-labelledby="bracket-heading">
        <h3 id="bracket-heading" className="section-title">
          {t("bracket.heading")}
        </h3>
        <p className="text-[var(--tf-ink-muted)]">{t("bracket.empty")}</p>
      </section>
    );
  }

  const rounds = [...new Set(knockout.map((m) => m.round))].sort(
    (a, b) => a - b,
  );

  return (
    <section aria-labelledby="bracket-heading" className="space-y-4">
      <h3 id="bracket-heading" className="section-title">
        {t("bracket.heading")}
      </h3>
      <div className="bracket-scroll overflow-x-auto pb-2">
        <div
          className="flex min-w-min gap-6"
          role="list"
          aria-label={t("bracket.listLabel")}
        >
          {rounds.map((round) => {
            const roundMatches = knockout.filter((m) => m.round === round);
            const teamsInRound = roundMatches.length * 2;
            const label =
              localizeMatchLabel(
                roundMatches[0]!,
                groups,
                t,
                teamsInRound,
              ) || t("bracket.roundFallback", { round });
            return (
              <div
                key={round}
                className="flex w-64 shrink-0 flex-col gap-3"
                role="list"
                aria-label={label}
              >
                <h4 className="text-sm font-semibold text-[var(--tf-ink)]">
                  {label}
                </h4>
                {roundMatches.map((match) => {
                  const home = findTeam(teams, match.homeTeamId);
                  const away = findTeam(teams, match.awayTeamId);
                  const homeName = home?.name ?? t("matches.waiting");
                  const awayName = away?.name ?? t("matches.waiting");
                  const scoreText =
                    match.homeScore === null || match.awayScore === null
                      ? t("matches.vs")
                      : `${match.homeScore} : ${match.awayScore}`;
                  return (
                    <article
                      key={match.id}
                      role="listitem"
                      className="bracket-match rounded-md border border-[var(--tf-line)] bg-[var(--tf-foam)] p-3"
                      aria-label={`${homeName} ${scoreText} ${awayName}`}
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        {home ? (
                          <TeamBadge team={home} compact />
                        ) : (
                          <span className="font-medium">{homeName}</span>
                        )}
                        <span className="tabular-nums">
                          {match.homeScore ?? "–"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                        {away ? (
                          <TeamBadge team={away} compact />
                        ) : (
                          <span className="font-medium">{awayName}</span>
                        )}
                        <span className="tabular-nums">
                          {match.awayScore ?? "–"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
