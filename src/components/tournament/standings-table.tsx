import type { StandingRow, Team } from "@/lib/tournament";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StandingsTableProps {
  title: string;
  standings: StandingRow[];
  teams: Team[];
}

function teamName(teams: Team[], id: string): string {
  return teams.find((t) => t.id === id)?.name ?? id;
}

export function StandingsTable({ title, standings, teams }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <section aria-labelledby={`standings-${title}`}>
        <h3 id={`standings-${title}`} className="section-title">
          {title}
        </h3>
        <p className="text-[var(--tf-ink-muted)]">Няма класиране все още.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`standings-${title}`} className="space-y-3">
      <h3 id={`standings-${title}`} className="section-title">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-[var(--tf-line)] bg-[var(--tf-foam)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">#</TableHead>
              <TableHead scope="col">Отбор</TableHead>
              <TableHead scope="col" className="text-right">
                М
              </TableHead>
              <TableHead scope="col" className="text-right">
                П
              </TableHead>
              <TableHead scope="col" className="text-right">
                Р
              </TableHead>
              <TableHead scope="col" className="text-right">
                З
              </TableHead>
              <TableHead scope="col" className="text-right">
                ГР
              </TableHead>
              <TableHead scope="col" className="text-right">
                Т
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((row, index) => (
              <TableRow key={row.teamId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {teamName(teams, row.teamId)}
                </TableCell>
                <TableCell className="text-right">{row.played}</TableCell>
                <TableCell className="text-right">{row.won}</TableCell>
                <TableCell className="text-right">{row.drawn}</TableCell>
                <TableCell className="text-right">{row.lost}</TableCell>
                <TableCell className="text-right">
                  {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {row.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-[var(--tf-ink-muted)]">
        М = мачове, П = победи, Р = равенства, З = загуби, ГР = гол разлика, Т =
        точки
      </p>
    </section>
  );
}
