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

/** Pairing fingerprint without ephemeral match ids. */
function scheduleFingerprint(
  matches: ReturnType<typeof generateRoundRobinMatches>,
) {
  return matches.map((m) => ({
    round: m.round,
    matchOrder: m.matchOrder,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    byeParticipantId: m.byeParticipantId,
  }));
}

function roundRows(
  matches: ReturnType<typeof generateRoundRobinMatches>,
  round: number,
) {
  return matches
    .filter((m) => m.round === round)
    .sort((a, b) => a.matchOrder - b.matchOrder);
}

describe("round-robin", () => {
  it("returns empty for N < 2", () => {
    expect(generateRoundRobinMatches([])).toEqual([]);
    expect(generateRoundRobinMatches(teams("Solo"))).toEqual([]);
  });

  /**
   * Classic circle Round 1 (1-indexed names → tm0..tm{N-1}):
   * odd N folds ends with mid bye; even N has no bye.
   */
  it.each([
    {
      n: 2,
      round1: [{ home: "tm0", away: "tm1" }],
    },
    {
      n: 3,
      round1: [
        { home: "tm0", away: "tm2" },
        { home: "tm1", away: null },
      ],
    },
    {
      n: 4,
      round1: [
        { home: "tm0", away: "tm3" },
        { home: "tm1", away: "tm2" },
      ],
    },
    {
      // TC-01
      n: 5,
      round1: [
        { home: "tm0", away: "tm4" },
        { home: "tm1", away: "tm3" },
        { home: "tm2", away: null },
      ],
    },
    {
      n: 6,
      round1: [
        { home: "tm0", away: "tm5" },
        { home: "tm1", away: "tm4" },
        { home: "tm2", away: "tm3" },
      ],
    },
    {
      n: 7,
      round1: [
        { home: "tm0", away: "tm6" },
        { home: "tm1", away: "tm5" },
        { home: "tm2", away: "tm4" },
        { home: "tm3", away: null },
      ],
    },
  ] as const)("Round 1 circle pattern for N=$n", ({ n, round1 }) => {
    const names = Array.from({ length: n }, (_, i) => String(i + 1));
    const matches = generateRoundRobinMatches(teams(...names));
    const r1 = roundRows(matches, 1);

    expect(r1).toHaveLength(round1.length);
    round1.forEach((expected, index) => {
      expect(r1[index]).toMatchObject({
        matchOrder: index + 1,
        homeTeamId: expected.home,
        awayTeamId: expected.away,
        ...(expected.away === null
          ? { byeParticipantId: expected.home }
          : {}),
      });
    });
  });

  it.each([2, 3, 4, 5, 6, 7] as const)(
    "N=%s: full RR completeness, bye integrity, no double-booking",
    (n) => {
      const names = Array.from({ length: n }, (_, i) => String(i + 1));
      const t = teams(...names);
      const matches = generateRoundRobinMatches(t);
      const playable = matches.filter((m) => m.homeTeamId && m.awayTeamId);
      const expectedPairs = (n * (n - 1)) / 2;
      const expectedRounds = n % 2 === 0 ? n - 1 : n;

      expect(playable).toHaveLength(expectedPairs);
      expect(matches.every((m) => m.matchOrder >= 1)).toBe(true);

      const pairKeys = playable.map((m) =>
        [m.homeTeamId!, m.awayTeamId!].sort().join("|"),
      );
      expect(new Set(pairKeys).size).toBe(expectedPairs);

      const rounds = [...new Set(matches.map((m) => m.round))].sort(
        (a, b) => a - b,
      );
      expect(rounds).toHaveLength(expectedRounds);

      for (const round of rounds) {
        const row = matches.filter((m) => m.round === round);
        const byes = row.filter((m) => m.byeParticipantId);
        const seen = new Set<string>();

        if (n % 2 === 1) {
          expect(byes).toHaveLength(1);
          const byeId = byes[0].byeParticipantId!;
          expect(
            row.some(
              (m) =>
                m !== byes[0] &&
                (m.homeTeamId === byeId || m.awayTeamId === byeId),
            ),
          ).toBe(false);
        } else {
          expect(byes).toHaveLength(0);
          expect(row.every((m) => m.homeTeamId && m.awayTeamId)).toBe(true);
        }

        for (const match of row) {
          for (const id of [match.homeTeamId, match.awayTeamId]) {
            if (!id) continue;
            expect(seen.has(id)).toBe(false);
            seen.add(id);
          }
        }
        expect(seen.size).toBe(n);

        const orders = row.map((m) => m.matchOrder).sort((a, b) => a - b);
        expect(orders).toEqual(
          Array.from({ length: row.length }, (_, i) => i + 1),
        );
      }
    },
  );

  it.each([2, 3, 4, 5, 6, 7] as const)(
    "N=%s: regeneration with same input order is stable",
    (n) => {
      const names = Array.from({ length: n }, (_, i) => String(i + 1));
      const t = teams(...names);
      expect(scheduleFingerprint(generateRoundRobinMatches(t))).toEqual(
        scheduleFingerprint(generateRoundRobinMatches(t)),
      );
    },
  );

  it("TC-01: five participants round 1 is 1–5, 2–4, bye 3", () => {
    const t = teams("1", "2", "3", "4", "5");
    const round1 = roundRows(generateRoundRobinMatches(t), 1);

    expect(round1).toHaveLength(3);
    expect(round1[0]).toMatchObject({
      matchOrder: 1,
      homeTeamId: "tm0",
      awayTeamId: "tm4",
    });
    expect(round1[1]).toMatchObject({
      matchOrder: 2,
      homeTeamId: "tm1",
      awayTeamId: "tm3",
    });
    expect(round1[2]).toMatchObject({
      matchOrder: 3,
      homeTeamId: "tm2",
      awayTeamId: null,
      byeParticipantId: "tm2",
    });
  });
});

describe("standings", () => {
  it("ranks by points then goal difference", () => {
    const t = teams("A", "B", "C");
    const matches = generateRoundRobinMatches(t).filter(
      (m) => m.homeTeamId && m.awayTeamId,
    );
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

  it("builds a single round-robin league table", () => {
    let tournament = createEmptyTournament({
      name: "League",
      sport: "Football",
      startDate: "2026-01-01",
      endDate: "2026-06-01",
      format: "league",
    });
    for (const name of ["A", "B", "C", "D"]) {
      tournament = addTeam(tournament, name);
    }
    tournament = generateFixtures(tournament);
    expect(tournament.groups).toHaveLength(0);
    expect(tournament.matches).toHaveLength(6);
    expect(tournament.matches.every((m) => m.stage === "group")).toBe(true);

    for (const match of tournament.matches) {
      tournament = setMatchScore(tournament, match.id, 1, 0);
    }

    const standings = computeStandings(
      tournament.teams.map((team) => team.id),
      tournament.matches,
    );
    expect(standings.every((row) => row.played === 3)).toBe(true);
    expect(standings[0].points).toBeGreaterThanOrEqual(standings[1].points);
  });
});

describe("participantType", () => {
  it("defaults to team when omitted", () => {
    const tournament = createEmptyTournament({
      name: "Default",
      sport: "Football",
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      format: "league",
    });
    expect(tournament.participantType).toBe("team");
  });

  it("persists individual and generates fixtures for every format", () => {
    const formats = [
      "groups",
      "knockout",
      "groups_knockout",
      "league",
      "swiss",
    ] as const;

    for (const format of formats) {
      let tournament = createEmptyTournament({
        name: `Individual ${format}`,
        sport: "Chess",
        startDate: "2026-01-01",
        endDate: "2026-01-03",
        format,
        participantType: "individual",
        groupCount: 2,
        advancePerGroup: 2,
      });
      expect(tournament.participantType).toBe("individual");

      for (const name of ["Ana", "Borislav", "Clara", "Dimitar"]) {
        tournament = addTeam(tournament, name);
      }
      tournament = generateFixtures(tournament);
      expect(tournament.participantType).toBe("individual");
      expect(tournament.matches.length).toBeGreaterThan(0);
    }
  });
});
