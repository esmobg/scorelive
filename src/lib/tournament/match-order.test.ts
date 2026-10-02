import { describe, expect, it } from "vitest";
import { ensureMatchOrders, sortMatches } from "./match-order";
import type { Match } from "./types";

function match(
  partial: Partial<Match> & Pick<Match, "id" | "round">,
): Omit<Match, "matchOrder"> & { matchOrder?: number } {
  return {
    stage: "group",
    label: `Round ${partial.round}`,
    homeTeamId: "a",
    awayTeamId: "b",
    homeScore: null,
    awayScore: null,
    ...partial,
  };
}

describe("match order normalize + sort", () => {
  it("fills missing matchOrder deterministically within a round", () => {
    const normalized = ensureMatchOrders([
      match({ id: "m-b", round: 1 }),
      match({ id: "m-a", round: 1 }),
      match({ id: "m-c", round: 2, matchOrder: 9 }),
    ]);
    const round1 = normalized
      .filter((m) => m.round === 1)
      .sort((a, b) => a.matchOrder - b.matchOrder);
    expect(round1.map((m) => m.id)).toEqual(["m-a", "m-b"]);
    expect(round1.map((m) => m.matchOrder)).toEqual([1, 2]);
    expect(normalized.find((m) => m.id === "m-c")?.matchOrder).toBe(9);
  });

  it("sorts by stage, round, then matchOrder", () => {
    const sorted = sortMatches(
      ensureMatchOrders([
        match({ id: "g2", round: 2, matchOrder: 1, stage: "group" }),
        match({ id: "g1b", round: 1, matchOrder: 2, stage: "group" }),
        match({ id: "g1a", round: 1, matchOrder: 1, stage: "group" }),
        match({ id: "k1", round: 1, matchOrder: 1, stage: "knockout" }),
      ]),
    );
    expect(sorted.map((m) => m.id)).toEqual(["g1a", "g1b", "g2", "k1"]);
  });
});
