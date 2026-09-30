import type { Match, Tournament } from "./types";

/** Poll interval for public tournament live follow (ms). */
export const LIVE_POLL_MS = 5000;

/**
 * Compact fingerprint of scores/standings-driving state for change detection.
 */
export function tournamentLiveFingerprint(
  tournament: Pick<Tournament, "updatedAt" | "matches">,
): string {
  const scores = tournament.matches
    .map(
      (match: Match) =>
        `${match.id}:${match.homeScore ?? "n"}:${match.awayScore ?? "n"}`,
    )
    .join(";");
  return `${tournament.updatedAt}|${scores}`;
}
