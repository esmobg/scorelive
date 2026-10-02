import { describe, expect, it } from "vitest";
import type { Match } from "./types";
import { LIVE_POLL_MS, tournamentLiveFingerprint } from "./live-follow";

function match(partial: Partial<Match> & Pick<Match, "id">): Match {
  return {
    stage: "group",
    round: 1,
    matchOrder: 1,
    label: "Round 1",
    homeTeamId: "a",
    awayTeamId: "b",
    homeScore: null,
    awayScore: null,
    ...partial,
  };
}

describe("live follow helpers", () => {
  it("uses a 5 second poll interval", () => {
    expect(LIVE_POLL_MS).toBe(5000);
  });

  it("changes fingerprint when a score changes", () => {
    const before = tournamentLiveFingerprint({
      updatedAt: "2026-01-01T00:00:00.000Z",
      matches: [match({ id: "m1", homeScore: 1, awayScore: 0 })],
    });
    const after = tournamentLiveFingerprint({
      updatedAt: "2026-01-01T00:00:00.000Z",
      matches: [match({ id: "m1", homeScore: 2, awayScore: 0 })],
    });
    expect(before).not.toBe(after);
  });

  it("changes fingerprint when updatedAt changes", () => {
    const matches = [match({ id: "m1", homeScore: 0, awayScore: 0 })];
    const before = tournamentLiveFingerprint({
      updatedAt: "2026-01-01T00:00:00.000Z",
      matches,
    });
    const after = tournamentLiveFingerprint({
      updatedAt: "2026-01-01T00:00:05.000Z",
      matches,
    });
    expect(before).not.toBe(after);
  });

  it("keeps fingerprint stable for identical state", () => {
    const state = {
      updatedAt: "2026-01-01T00:00:00.000Z",
      matches: [match({ id: "m1", homeScore: null, awayScore: null })],
    };
    expect(tournamentLiveFingerprint(state)).toBe(
      tournamentLiveFingerprint(state),
    );
  });
});
