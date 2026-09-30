import { createId } from "./id";
import type { Match, StandingRow, Team, Tournament } from "./types";

const POINTS_WIN = 1;
const POINTS_DRAW = 0.5;

export interface SwissStandingRow extends StandingRow {
  buchholz: number;
}

/** Default Swiss round count: ceil(log2(n)), minimum 3 when n ≥ 4. */
export function defaultSwissRounds(teamCount: number): number {
  if (teamCount < 2) return 0;
  if (teamCount < 4) return Math.max(1, teamCount - 1);
  return Math.max(3, Math.ceil(Math.log2(teamCount)));
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function playedPairs(matches: Match[]): Set<string> {
  const set = new Set<string>();
  for (const match of matches) {
    if (match.homeTeamId && match.awayTeamId) {
      set.add(pairKey(match.homeTeamId, match.awayTeamId));
    }
  }
  return set;
}

/**
 * Swiss points: win = 1, draw = 0.5 (common Swiss scoring).
 * Byes (null opponent with a filled score) count as a win for the present side.
 */
export function computeSwissStandings(
  teamIds: string[],
  matches: Match[],
): SwissStandingRow[] {
  const table = new Map<string, SwissStandingRow>();
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
      buchholz: 0,
    });
  }

  const opponents = new Map<string, string[]>();
  for (const teamId of teamIds) {
    opponents.set(teamId, []);
  }

  for (const match of matches) {
    if (match.homeScore === null || match.awayScore === null) {
      continue;
    }

    // Bye: one side present
    if (match.homeTeamId && !match.awayTeamId) {
      const home = table.get(match.homeTeamId);
      if (!home) continue;
      home.played += 1;
      home.won += 1;
      home.points += POINTS_WIN;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      continue;
    }
    if (match.awayTeamId && !match.homeTeamId) {
      const away = table.get(match.awayTeamId);
      if (!away) continue;
      away.played += 1;
      away.won += 1;
      away.points += POINTS_WIN;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;
      continue;
    }

    if (!match.homeTeamId || !match.awayTeamId) {
      continue;
    }

    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;
    opponents.get(match.homeTeamId)?.push(match.awayTeamId);
    opponents.get(match.awayTeamId)?.push(match.homeTeamId);

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
    const oppIds = opponents.get(row.teamId) ?? [];
    row.buchholz = oppIds.reduce(
      (sum, oppId) => sum + (table.get(oppId)?.points ?? 0),
      0,
    );
  }

  return [...table.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return a.teamId.localeCompare(b.teamId);
  });
}

/**
 * Pair players by current standings; avoid rematches; assign one bye if odd.
 */
export function pairSwissRound(
  teams: Team[],
  previousMatches: Match[],
  round: number,
): Match[] {
  const standings = computeSwissStandings(
    teams.map((t) => t.id),
    previousMatches,
  );
  const ordered = standings.map(
    (row) => teams.find((t) => t.id === row.teamId)!,
  );
  const seen = playedPairs(previousMatches);
  const unpaired = [...ordered];
  const matches: Match[] = [];

  // Bye for lowest-ranked unpaired if odd (prefer someone who has not had a bye).
  if (unpaired.length % 2 === 1) {
    let byeIndex = unpaired.length - 1;
    for (let i = unpaired.length - 1; i >= 0; i -= 1) {
      const hadBye = previousMatches.some(
        (m) =>
          (m.homeTeamId === unpaired[i].id && !m.awayTeamId) ||
          (m.awayTeamId === unpaired[i].id && !m.homeTeamId),
      );
      if (!hadBye) {
        byeIndex = i;
        break;
      }
    }
    const [byeTeam] = unpaired.splice(byeIndex, 1);
    matches.push({
      id: createId("m"),
      stage: "swiss",
      round,
      label: `Swiss · Round ${round} · Bye`,
      homeTeamId: byeTeam.id,
      awayTeamId: null,
      homeScore: 1,
      awayScore: 0,
    });
  }

  const remaining = [...unpaired];
  while (remaining.length >= 2) {
    const home = remaining.shift()!;
    let awayIndex = remaining.findIndex(
      (candidate) => !seen.has(pairKey(home.id, candidate.id)),
    );
    if (awayIndex === -1) {
      awayIndex = 0;
    }
    const [away] = remaining.splice(awayIndex, 1);
    seen.add(pairKey(home.id, away.id));
    matches.push({
      id: createId("m"),
      stage: "swiss",
      round,
      label: `Swiss · Round ${round}`,
      homeTeamId: home.id,
      awayTeamId: away.id,
      homeScore: null,
      awayScore: null,
    });
  }

  return matches;
}

export function currentSwissRound(matches: Match[]): number {
  if (matches.length === 0) return 0;
  return Math.max(...matches.map((m) => m.round));
}

export function isSwissRoundComplete(
  matches: Match[],
  round: number,
): boolean {
  const roundMatches = matches.filter(
    (m) => m.stage === "swiss" && m.round === round,
  );
  if (roundMatches.length === 0) return false;
  return roundMatches.every(
    (m) => m.homeScore !== null && m.awayScore !== null,
  );
}

export function canGenerateNextSwissRound(tournament: Tournament): boolean {
  if (tournament.format !== "swiss") return false;
  if (tournament.teams.length < 2) return false;
  const maxRounds =
    tournament.swissRounds ?? defaultSwissRounds(tournament.teams.length);
  const current = currentSwissRound(tournament.matches);
  if (current === 0) return true;
  if (current >= maxRounds) return false;
  return isSwissRoundComplete(tournament.matches, current);
}

export function generateSwissFixtures(tournament: Tournament): Tournament {
  const rounds =
    tournament.swissRounds && tournament.swissRounds > 0
      ? tournament.swissRounds
      : defaultSwissRounds(tournament.teams.length);
  const firstRound = pairSwissRound(tournament.teams, [], 1);
  return {
    ...tournament,
    groups: [],
    matches: firstRound,
    swissRounds: rounds,
    updatedAt: new Date().toISOString(),
  };
}

export function generateNextSwissRound(tournament: Tournament): Tournament {
  if (!canGenerateNextSwissRound(tournament)) {
    return tournament;
  }
  const current = currentSwissRound(tournament.matches);
  const nextRound = current + 1;
  const newMatches = pairSwissRound(
    tournament.teams,
    tournament.matches,
    nextRound,
  );
  return {
    ...tournament,
    matches: [...tournament.matches, ...newMatches],
    updatedAt: new Date().toISOString(),
  };
}
