import type { Match, Team } from "./types";
import { createId } from "./id";

/**
 * Classic circle-method round-robin for any N ≥ 2.
 *
 * Builds an even-length circle: for odd participant counts, inserts a BYE at
 * index ceil(N/2) (between the two halves). Each round pairs slot i with
 * slot (circleSize − 1 − i), then rotates every slot except index 0.
 *
 * Round 1 pattern (1-indexed input order):
 * - Odd N: 1–N, 2–(N−1), …, bye at (N+1)/2
 *   e.g. N=5 → 1–5, 2–4, bye 3; N=7 → 1–7, 2–6, 3–5, bye 4
 * - Even N: 1–N, 2–(N−1), …, N/2 – (N/2+1); no byes
 *
 * Full schedule: each unordered pair meets exactly once; same input order
 * yields the same pairings and matchOrder. Fewer than 2 teams → [].
 */
export function generateRoundRobinMatches(
  teams: Team[],
  options: { groupId?: string; groupName?: string } = {},
): Match[] {
  if (teams.length < 2) {
    return [];
  }

  const { groupId, groupName } = options;
  const slots: (Team | null)[] = [...teams];
  if (slots.length % 2 === 1) {
    // Mid-circle bye: round 1 folds ends → middle bye for every odd N.
    slots.splice(Math.ceil(slots.length / 2), 0, null);
  }

  const circleSize = slots.length;
  const rounds = circleSize - 1;
  const half = circleSize / 2;
  const matches: Match[] = [];
  const rotation = [...slots];

  for (let round = 0; round < rounds; round += 1) {
    const roundNumber = round + 1;
    const labelBase = groupName
      ? `${groupName} · Кръг ${roundNumber}`
      : `Кръг ${roundNumber}`;

    const playable: Match[] = [];
    let byeMatch: Match | null = null;

    for (let i = 0; i < half; i += 1) {
      const home = rotation[i];
      const away = rotation[circleSize - 1 - i];

      if (home && away) {
        playable.push({
          id: createId("m"),
          stage: "group",
          round: roundNumber,
          matchOrder: 0,
          label: labelBase,
          groupId,
          homeTeamId: home.id,
          awayTeamId: away.id,
          homeScore: null,
          awayScore: null,
        });
        continue;
      }

      const byeTeam = home ?? away;
      if (!byeTeam || byeMatch) {
        continue;
      }

      byeMatch = {
        id: createId("m"),
        stage: "group",
        round: roundNumber,
        matchOrder: 0,
        label: labelBase,
        groupId,
        homeTeamId: byeTeam.id,
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        byeParticipantId: byeTeam.id,
      };
    }

    let order = 1;
    for (const match of playable) {
      matches.push({ ...match, matchOrder: order });
      order += 1;
    }
    if (byeMatch) {
      matches.push({ ...byeMatch, matchOrder: order });
    }

    // Rotate all but first slot (classic circle method).
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop()!);
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  return matches;
}

/**
 * Partition teams into `groupCount` groups as evenly as possible.
 */
export function assignGroups(
  teams: Team[],
  groupCount: number,
): { groups: { id: string; name: string; teamIds: string[] }[]; groupTeams: Team[][] } {
  const count = Math.max(1, Math.min(groupCount, teams.length));
  const groups = Array.from({ length: count }, (_, i) => ({
    id: createId("g"),
    name: `Група ${String.fromCharCode(65 + i)}`,
    teamIds: [] as string[],
  }));
  const groupTeams: Team[][] = Array.from({ length: count }, () => []);

  teams.forEach((team, index) => {
    const g = index % count;
    groups[g].teamIds.push(team.id);
    groupTeams[g].push(team);
  });

  return { groups, groupTeams };
}

export function generateGroupStage(
  teams: Team[],
  groupCount: number,
): { groups: { id: string; name: string; teamIds: string[] }[]; matches: Match[] } {
  const { groups, groupTeams } = assignGroups(teams, groupCount);
  const matches = groups.flatMap((group, i) =>
    generateRoundRobinMatches(groupTeams[i], {
      groupId: group.id,
      groupName: group.name,
    }),
  );
  return { groups, matches };
}
