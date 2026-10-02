import type { Match, Team } from "./types";
import { createId } from "./id";

/**
 * Circle method round-robin: each team plays every other once.
 * Odd counts insert a bye so round 1 folds as 1–n, 2–(n-1), … middle bye.
 * Returns matches for a single group (or the whole field if no groups).
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
    // Insert bye between the two halves so round 1 is 1–n, 2–(n-1), bye middle.
    slots.splice(Math.ceil(slots.length / 2), 0, null);
  }

  const n = slots.length;
  const rounds = n - 1;
  const half = n / 2;
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
      const away = rotation[n - 1 - i];

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

    // Rotate all but first slot
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
