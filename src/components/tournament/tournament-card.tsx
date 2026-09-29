import Link from "next/link";
import type { Tournament, TournamentFormat } from "@/lib/tournament";
import { Badge } from "@/components/ui/badge";

const formatLabels: Record<TournamentFormat, string> = {
  groups: "Групи",
  knockout: "Елиминации",
  groups_knockout: "Групи → елиминации",
};

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const played = tournament.matches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null,
  ).length;
  const total = tournament.matches.length;

  return (
    <article className="flex flex-col gap-3 border-b border-[var(--tf-line)] py-5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--tf-ink)]">
            <Link
              href={`/tournaments/${tournament.id}`}
              className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
            >
              {tournament.name}
            </Link>
          </h3>
          <p className="text-sm text-[var(--tf-ink-muted)]">
            {tournament.sport} · {tournament.startDate} — {tournament.endDate}
          </p>
        </div>
        <Badge variant="secondary">{formatLabels[tournament.format]}</Badge>
      </div>
      <p className="text-sm text-[var(--tf-ink)]">
        {tournament.teams.length} отбора · {played}/{total || 0} изиграни мача
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/tournaments/${tournament.id}`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          Следвай турнира
        </Link>
        <Link
          href={`/organize/${tournament.id}`}
          className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--tf-ink)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          Управление
        </Link>
      </div>
    </article>
  );
}

export { formatLabels };
