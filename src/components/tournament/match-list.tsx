import type { Match, Team } from "@/lib/tournament";
import { Badge } from "@/components/ui/badge";

interface MatchListProps {
  matches: Match[];
  teams: Team[];
  emptyMessage?: string;
}

function teamName(teams: Team[], id: string | null): string {
  if (!id) return "Чака се";
  return teams.find((t) => t.id === id)?.name ?? "—";
}

function statusLabel(match: Match): { text: string; done: boolean } {
  if (match.homeScore !== null && match.awayScore !== null) {
    return { text: "Изигран", done: true };
  }
  if (!match.homeTeamId || !match.awayTeamId) {
    return { text: "Чака се", done: false };
  }
  return { text: "Предстои", done: false };
}

export function MatchList({
  matches,
  teams,
  emptyMessage = "Няма мачове.",
}: MatchListProps) {
  if (matches.length === 0) {
    return <p className="text-[var(--tf-ink-muted)]">{emptyMessage}</p>;
  }

  const sorted = [...matches].sort((a, b) => {
    if (a.stage !== b.stage) {
      return a.stage === "group" ? -1 : 1;
    }
    return a.round - b.round || a.label.localeCompare(b.label);
  });

  return (
    <ul className="space-y-2" aria-label="Списък с мачове">
      {sorted.map((match) => {
        const status = statusLabel(match);
        return (
          <li
            key={match.id}
            className="flex flex-col gap-2 rounded-md border border-[var(--tf-line)] bg-[var(--tf-foam)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--tf-ink-muted)]">
                {match.label}
              </p>
              <p className="text-base font-medium text-[var(--tf-ink)]">
                <span>{teamName(teams, match.homeTeamId)}</span>
                <span className="mx-2 tabular-nums text-[var(--tf-accent-deep)]">
                  {match.homeScore !== null && match.awayScore !== null
                    ? `${match.homeScore} : ${match.awayScore}`
                    : "– : –"}
                </span>
                <span>{teamName(teams, match.awayTeamId)}</span>
              </p>
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
