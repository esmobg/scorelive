import type { Match, Team } from "@/lib/tournament";

interface BracketViewProps {
  matches: Match[];
  teams: Team[];
}

function teamName(teams: Team[], id: string | null): string {
  if (!id) return "Чака се";
  return teams.find((t) => t.id === id)?.name ?? "—";
}

function scoreText(match: Match): string {
  if (match.homeScore === null || match.awayScore === null) {
    return "срещу";
  }
  return `${match.homeScore} : ${match.awayScore}`;
}

export function BracketView({ matches, teams }: BracketViewProps) {
  const knockout = matches
    .filter((m) => m.stage === "knockout")
    .sort((a, b) => a.round - b.round || (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0));

  if (knockout.length === 0) {
    return (
      <section aria-labelledby="bracket-heading">
        <h3 id="bracket-heading" className="section-title">
          Елиминации
        </h3>
        <p className="text-[var(--tf-ink-muted)]">
          Схемата ще се появи, когато има елиминационна фаза.
        </p>
      </section>
    );
  }

  const rounds = [...new Set(knockout.map((m) => m.round))].sort(
    (a, b) => a - b,
  );

  return (
    <section aria-labelledby="bracket-heading" className="space-y-4">
      <h3 id="bracket-heading" className="section-title">
        Елиминации
      </h3>
      <div className="bracket-scroll overflow-x-auto pb-2">
        <div
          className="flex min-w-min gap-6"
          role="list"
          aria-label="Елиминационна схема"
        >
          {rounds.map((round) => {
            const roundMatches = knockout.filter((m) => m.round === round);
            const label = roundMatches[0]?.label ?? `Рунд ${round}`;
            return (
              <div
                key={round}
                className="flex w-56 shrink-0 flex-col gap-3"
                role="list"
                aria-label={label}
              >
                <h4 className="text-sm font-semibold text-[var(--tf-ink)]">
                  {label}
                </h4>
                {roundMatches.map((match) => (
                  <article
                    key={match.id}
                    role="listitem"
                    className="bracket-match rounded-md border border-[var(--tf-line)] bg-[var(--tf-foam)] p-3"
                    aria-label={`${teamName(teams, match.homeTeamId)} ${scoreText(match)} ${teamName(teams, match.awayTeamId)}`}
                  >
                    <p className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">
                        {teamName(teams, match.homeTeamId)}
                      </span>
                      <span className="tabular-nums">
                        {match.homeScore ?? "–"}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">
                        {teamName(teams, match.awayTeamId)}
                      </span>
                      <span className="tabular-nums">
                        {match.awayScore ?? "–"}
                      </span>
                    </p>
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
