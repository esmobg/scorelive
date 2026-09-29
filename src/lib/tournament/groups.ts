import type { Match, Team } from "./types";
import { createId } from "./id";

/**
 * Circle method round-robin: each team plays every other once.
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
    slots.push(null);
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

    for (let i = 0; i < half; i += 1) {
      const home = rotation[i];
      const away = rotation[n - 1 - i];
      if (!home || !away) {
        continue;
      }

      matches.push({
        id: createId("m"),
        stage: "group",
        round: roundNumber,
        label: labelBase,
        groupId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeScore: null,
        awayScore: null,
      });
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
