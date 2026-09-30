"use client";

import type { ParticipantType, StandingRow, Team } from "@/lib/tournament";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamBadge } from "@/components/tournament/team-badge";
import { useLocale } from "@/i18n/locale-provider";

interface StandingsTableProps {
  title: string;
  standings: StandingRow[];
  teams: Team[];
  showBuchholz?: boolean;
  participantType?: ParticipantType;
}

export function StandingsTable({
  title,
  standings,
  teams,
  showBuchholz = false,
  participantType = "team",
}: StandingsTableProps) {
  const { t } = useLocale();
  const colLabel =
    participantType === "individual"
      ? t("standings.colPlayer")
      : t("standings.colTeam");

  if (standings.length === 0) {
    return (
      <section aria-labelledby={`standings-${title}`}>
        <h3 id={`standings-${title}`} className="section-title">
          {title}
        </h3>
        <p className="text-[var(--tf-ink-muted)]">{t("standings.empty")}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`standings-${title}`} className="space-y-3">
      <h3 id={`standings-${title}`} className="section-title">
        {title}
      </h3>
      <div className="table-scroll rounded-lg border border-[var(--tf-line)] bg-[var(--tf-foam)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t("standings.colRank")}</TableHead>
              <TableHead scope="col">{colLabel}</TableHead>
              <TableHead scope="col" className="text-right">
                {t("standings.colPlayed")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("standings.colWon")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("standings.colDrawn")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("standings.colLost")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("standings.colDiff")}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {t("standings.colPoints")}
              </TableHead>
              {showBuchholz ? (
                <TableHead scope="col" className="text-right">
                  {t("standings.colBuchholz")}
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((row, index) => {
              const team = teams.find((item) => item.id === row.teamId);
              return (
                <TableRow key={row.teamId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {team ? (
                      <TeamBadge team={team} compact />
                    ) : (
                      row.teamId
                    )}
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
                  {showBuchholz ? (
                    <TableCell className="text-right">
                      {row.buchholz ?? 0}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-[var(--tf-ink-muted)]">
        {showBuchholz ? t("standings.legendSwiss") : t("standings.legend")}
      </p>
    </section>
  );
}
