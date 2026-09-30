import { describe, expect, it } from "vitest";
import {
  addTeam,
  canGenerateNextSwissRound,
  computeSwissStandings,
  createEmptyTournament,
  currentSwissRound,
  defaultSwissRounds,
  generateFixtures,
  generateNextSwissRound,
  pairSwissRound,
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

describe("swiss defaults", () => {
  it("uses ceil(log2(n)) with min 3 for n≥4", () => {
    expect(defaultSwissRounds(8)).toBe(3);
    expect(defaultSwissRounds(16)).toBe(4);
    expect(defaultSwissRounds(5)).toBe(3);
  });
});

describe("swiss pairing", () => {
  it("pairs without rematches and assigns one bye when odd", () => {
    const roster = teams("A", "B", "C", "D", "E");
    const round1 = pairSwissRound(roster, [], 1);
    const byes = round1.filter((m) => !m.awayTeamId || !m.homeTeamId);
    expect(byes).toHaveLength(1);
    expect(byes[0].homeScore).toBe(1);
    expect(round1.filter((m) => m.homeTeamId && m.awayTeamId)).toHaveLength(2);

    const round2 = pairSwissRound(roster, round1, 2);
    const pairs1 = new Set(
      round1
        .filter((m) => m.homeTeamId && m.awayTeamId)
        .map((m) => [m.homeTeamId!, m.awayTeamId!].sort().join("|")),
    );
    for (const match of round2.filter((m) => m.homeTeamId && m.awayTeamId)) {
      const key = [match.homeTeamId!, match.awayTeamId!].sort().join("|");
      expect(pairs1.has(key)).toBe(false);
    }
  });

  it("ranks by points then Buchholz", () => {
    const roster = teams("A", "B", "C", "D");
    let t = createEmptyTournament({
      name: "Swiss",
      sport: "Chess",
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      format: "swiss",
      swissRounds: 2,
    });
    for (const team of roster) {
      t = {
        ...t,
        teams: [...t.teams, team],
      };
    }
    t = generateFixtures(t);
    expect(currentSwissRound(t.matches)).toBe(1);

    const playable = t.matches.filter((m) => m.homeTeamId && m.awayTeamId);
    expect(playable.length).toBe(2);
    t = setMatchScore(t, playable[0].id, 1, 0);
    t = setMatchScore(t, playable[1].id, 1, 0);

    // Completing round 1 should auto-generate round 2
    expect(currentSwissRound(t.matches)).toBe(2);

    const standings = computeSwissStandings(
      t.teams.map((x) => x.id),
      t.matches.filter((m) => m.round === 1),
    );
    expect(standings[0].points).toBe(1);
    expect(standings[0].buchholz).toBeGreaterThanOrEqual(0);
  });

  it("wires generateFixtures and next-round gate", () => {
    let t = createEmptyTournament({
      name: "S",
      sport: "Chess",
      startDate: "2026-01-01",
      endDate: "2026-01-03",
      format: "swiss",
      swissRounds: 3,
    });
    for (const name of ["A", "B", "C", "D"]) {
      t = addTeam(t, name);
    }
    t = generateFixtures(t);
    expect(t.matches.every((m) => m.stage === "swiss")).toBe(true);
    expect(canGenerateNextSwissRound(t)).toBe(false);
    for (const match of t.matches.filter((m) => m.homeTeamId && m.awayTeamId)) {
      t = {
        ...t,
        matches: t.matches.map((m) =>
          m.id === match.id ? { ...m, homeScore: 1, awayScore: 0 } : m,
        ),
      };
    }
    expect(canGenerateNextSwissRound(t)).toBe(true);
    t = generateNextSwissRound(t);
    expect(currentSwissRound(t.matches)).toBe(2);
  });
});
