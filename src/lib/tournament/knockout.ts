import type { Match, Team } from "./types";
import { createId } from "./id";
import { knockoutRoundLabel } from "./labels";

export { knockoutRoundLabel } from "./labels";

/** Next power of two ≥ n (minimum 2). */
export function nextPowerOfTwo(n: number): number {
  let p = 2;
  while (p < n) {
    p *= 2;
  }
  return p;
}

/**
 * Build a single-elimination bracket for the given seeded teams.
 * Byes fill empty slots when team count is not a power of two.
 * Winners feed into `nextMatchId` / `nextMatchSlot`.
 */
export function generateKnockoutBracket(teams: Team[]): Match[] {
  if (teams.length < 2) {
    return [];
  }

  const bracketSize = nextPowerOfTwo(teams.length);
  const byeCount = bracketSize - teams.length;
  const firstRoundMatchCount = bracketSize / 2;

  const rounds: Match[][] = [];
  let teamsInRound = bracketSize;
  let roundIndex = 1;

  while (teamsInRound >= 2) {
    const matchCount = teamsInRound / 2;
    const roundMatches: Match[] = [];
    for (let slot = 0; slot < matchCount; slot += 1) {
      roundMatches.push({
        id: createId("m"),
        stage: "knockout",
        round: roundIndex,
        matchOrder: slot + 1,
        label: knockoutRoundLabel(teamsInRound),
        homeTeamId: null,
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        bracketSlot: slot,
      });
    }
    rounds.push(roundMatches);
    teamsInRound /= 2;
    roundIndex += 1;
  }

  // Wire advancement links
  for (let r = 0; r < rounds.length - 1; r += 1) {
    for (let slot = 0; slot < rounds[r].length; slot += 1) {
      const next = rounds[r + 1][Math.floor(slot / 2)];
      rounds[r][slot].nextMatchId = next.id;
      rounds[r][slot].nextMatchSlot = slot % 2 === 0 ? "home" : "away";
    }
  }

  // Seed first round: give top seeds byes (team vs empty), then pair remaining.
  const first = rounds[0];
  const queue = teams.map((t) => t.id);
  for (let slot = 0; slot < firstRoundMatchCount; slot += 1) {
    if (slot < byeCount) {
      first[slot].homeTeamId = queue.shift() ?? null;
      first[slot].awayTeamId = null;
    } else {
      first[slot].homeTeamId = queue.shift() ?? null;
      first[slot].awayTeamId = queue.shift() ?? null;
    }
  }

  for (const match of first) {
    if (match.homeTeamId && !match.awayTeamId) {
      match.homeScore = 1;
      match.awayScore = 0;
      advanceWinner(rounds.flat(), match);
    } else if (!match.homeTeamId && match.awayTeamId) {
      match.homeScore = 0;
      match.awayScore = 1;
      advanceWinner(rounds.flat(), match);
    }
  }

  return rounds.flat();
}

/** Place the winner of a completed match into its next bracket slot. */
export function advanceWinner(allMatches: Match[], match: Match): void {
  if (
    match.homeScore === null ||
    match.awayScore === null ||
    !match.nextMatchId ||
    !match.nextMatchSlot
  ) {
    return;
  }

  const winnerId =
    match.homeScore > match.awayScore
      ? match.homeTeamId
      : match.awayScore > match.homeScore
        ? match.awayTeamId
        : null;

  if (!winnerId) {
    return; // draws not supported in knockout — caller must resolve
  }

  const next = allMatches.find((m) => m.id === match.nextMatchId);
  if (!next) {
    return;
  }

  if (match.nextMatchSlot === "home") {
    next.homeTeamId = winnerId;
  } else {
    next.awayTeamId = winnerId;
  }
}

/**
 * After a knockout score is set/changed, clear downstream slots that depended
 * on the previous winner, then re-advance.
 */
export function applyKnockoutScore(
  matches: Match[],
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
): Match[] {
  const next = matches.map((m) => ({ ...m }));
  const match = next.find((m) => m.id === matchId);
  if (!match || match.stage !== "knockout") {
    return next;
  }

  clearDownstream(next, match);
  match.homeScore = homeScore;
  match.awayScore = awayScore;

  if (homeScore !== null && awayScore !== null && homeScore !== awayScore) {
    advanceWinner(next, match);
  }

  return next;
}

function clearDownstream(matches: Match[], from: Match): void {
  if (!from.nextMatchId || !from.nextMatchSlot) {
    return;
  }
  const next = matches.find((m) => m.id === from.nextMatchId);
  if (!next) {
    return;
  }

  const previousWinner =
    from.homeScore !== null &&
    from.awayScore !== null &&
    from.homeScore !== from.awayScore
      ? from.homeScore > from.awayScore
        ? from.homeTeamId
        : from.awayTeamId
      : null;

  if (from.nextMatchSlot === "home") {
    if (previousWinner && next.homeTeamId === previousWinner) {
      clearDownstream(matches, next);
      next.homeTeamId = null;
      next.homeScore = null;
      next.awayScore = null;
    } else if (!previousWinner) {
      // still clear if slot was set from this path ambiguously — leave alone
    }
  } else if (from.nextMatchSlot === "away") {
    if (previousWinner && next.awayTeamId === previousWinner) {
      clearDownstream(matches, next);
      next.awayTeamId = null;
      next.homeScore = null;
      next.awayScore = null;
    }
  }
}
