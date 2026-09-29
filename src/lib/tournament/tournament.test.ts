import { describe, expect, it } from "vitest";
import {
  addTeam,
  advanceFromGroups,
  computeStandings,
  createEmptyTournament,
  generateFixtures,
  generateKnockoutBracket,
  generateRoundRobinMatches,
  nextPowerOfTwo,
  setMatchScore,
  type Team,
} from "./index";

function teams(...names: string[]): Team[] {
  return names.map((name, i) => ({
    id: `tm${i}`,
    name,
    countryCode: "BG",
  }));
}

describe("round-robin", () => {
  it("generates n*(n-1)/2 matches for even team counts", () => {
    const t = teams("A", "B", "C", "D");
    const matches = generateRoundRobinMatches(t);
    expect(matches).toHaveLength(6);
    expect(matches.every((m) => m.homeTeamId && m.awayTeamId)).toBe(true);
  });

  it("handles odd team counts with byes (no null-null matches)", () => {
    const t = teams("A", "B", "C");
    const matches = generateRoundRobinMatches(t);
    expect(matches).toHaveLength(3);
    expect(matches.every((m) => m.homeTeamId && m.awayTeamId)).toBe(true);
  });
});

describe("standings", () => {
  it("ranks by points then goal difference", () => {
    const t = teams("A", "B", "C");
    const matches = generateRoundRobinMatches(t);
    // Force scores: A beats B 2-0, A draws C 1-1, B beats C 3-0
    const scored = matches.map((m) => {
      const pair = [m.homeTeamId, m.awayTeamId].sort().join("-");
      if (pair === "tm0-tm1") {
        return {
          ...m,
          homeTeamId: "tm0",
          awayTeamId: "tm1",
          homeScore: 2,
          awayScore: 0,
        };
      }
      if (pair === "tm0-tm2") {
        return {
          ...m,
          homeTeamId: "tm0",
          awayTeamId: "tm2",
          homeScore: 1,
          awayScore: 1,
        };
      }
      return {
        ...m,
        homeTeamId: "tm1",
        awayTeamId: "tm2",
        homeScore: 3,
        awayScore: 0,
      };
    });

    const standings = computeStandings(
      t.map((x) => x.id),
      scored,
    );
    expect(standings[0].teamId).toBe("tm0"); // 4 pts
    expect(standings[1].teamId).toBe("tm1"); // 3 pts
    expect(standings[2].teamId).toBe("tm2"); // 1 pt
  });
});

describe("knockout", () => {
  it("pads to next power of two", () => {
    expect(nextPowerOfTwo(6)).toBe(8);
    expect(nextPowerOfTwo(8)).toBe(8);
  });

  it("creates a connected bracket and auto-advances byes", () => {
    const t = teams("A", "B", "C", "D", "E", "F");
    const matches = generateKnockoutBracket(t);
    expect(matches.length).toBe(7); // 8-slot tree: 4+2+1
    const firstRound = matches.filter((m) => m.round === 1);
    const byeMatches = firstRound.filter(
      (m) =>
        (m.homeTeamId && !m.awayTeamId) || (!m.homeTeamId && m.awayTeamId),
    );
    expect(byeMatches.length).toBe(2);
    expect(
      byeMatches.every(
        (m) => m.homeScore !== null && m.awayScore !== null,
      ),
    ).toBe(true);

    const semis = matches.filter((m) => m.round === 2);
    const filledFromBye = semis.filter((m) => m.homeTeamId || m.awayTeamId);
    expect(filledFromBye.length).toBeGreaterThan(0);
  });
});

describe("fixtures + score entry", () => {
  it("builds groups→knockout and advances after group scores", () => {
    let tournament = createEmptyTournament({
      name: "Test",
      sport: "Football",
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      format: "groups_knockout",
      groupCount: 2,
      advancePerGroup: 2,
    });

    for (const name of ["A", "B", "C", "D", "E", "F", "G", "H"]) {
      tournament = addTeam(tournament, name);
    }
    tournament = generateFixtures(tournament);
    expect(tournament.groups).toHaveLength(2);
    expect(tournament.matches.every((m) => m.stage === "group")).toBe(true);

    for (const match of tournament.matches) {
      tournament = setMatchScore(tournament, match.id, 2, 1);
    }

    expect(tournament.matches.some((m) => m.stage === "knockout")).toBe(true);
    const advanced = advanceFromGroups(tournament);
    expect(advanced.matches.filter((m) => m.stage === "knockout").length).toBe(
      3,
    ); // 4 teams → 2+1
  });
});
