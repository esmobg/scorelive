import type { Match, StandingRow } from "./types";

const POINTS_WIN = 3;
const POINTS_DRAW = 1;

/**
 * Compute standings for a set of matches (typically one group, or all group matches).
 * Sort: points → goal diff → goals for → team id.
 */
export function computeStandings(
  teamIds: string[],
  matches: Match[],
): StandingRow[] {
  const table = new Map<string, StandingRow>();
  for (const teamId of teamIds) {
    table.set(teamId, {
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (
      match.homeScore === null ||
      match.awayScore === null ||
      !match.homeTeamId ||
      !match.awayTeamId
    ) {
      continue;
    }

    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);
    if (!home || !away) {
      continue;
    }

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += POINTS_WIN;
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      home.lost += 1;
      away.points += POINTS_WIN;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += POINTS_DRAW;
      away.points += POINTS_DRAW;
    }
  }

  for (const row of table.values()) {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
  }

  return [...table.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });
}

/** Top `count` team ids from standings. */
export function topTeamIds(standings: StandingRow[], count: number): string[] {
  return standings.slice(0, count).map((row) => row.teamId);
}
