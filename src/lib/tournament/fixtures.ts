import { generateGroupStage, generateRoundRobinMatches } from "./groups";
import { applyKnockoutScore, generateKnockoutBracket } from "./knockout";
import { computeStandings, topTeamIds } from "./standings";
import type {
  AddTeamInput,
  CreateTournamentInput,
  Team,
  Tournament,
} from "./types";
import { createId } from "./id";
import { normalizeCountryCode } from "@/lib/countries";

export function createEmptyTournament(input: CreateTournamentInput): Tournament {
  const now = new Date().toISOString();
  const owner =
    typeof input.ownerUsername === "string" ? input.ownerUsername.trim() : "";
  return {
    id: createId("t"),
    name: input.name.trim(),
    sport: input.sport.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    format: input.format,
    teams: [],
    groups: [],
    matches: [],
    groupCount: input.groupCount ?? 2,
    advancePerGroup: input.advancePerGroup ?? 2,
    ...(owner ? { ownerUsername: owner } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

export function addTeam(
  tournament: Tournament,
  input: string | AddTeamInput,
): Tournament {
  const payload: AddTeamInput =
    typeof input === "string"
      ? { name: input, countryCode: "BG" }
      : input;
  const trimmed = payload.name.trim();
  if (!trimmed) {
    return tournament;
  }
  const team: Team = {
    id: createId("tm"),
    name: trimmed,
    countryCode: normalizeCountryCode(payload.countryCode),
    ...(payload.logoDataUrl ? { logoDataUrl: payload.logoDataUrl } : {}),
  };
  return {
    ...tournament,
    teams: [...tournament.teams, team],
    updatedAt: new Date().toISOString(),
  };
}

export function removeTeam(tournament: Tournament, teamId: string): Tournament {
  return {
    ...tournament,
    teams: tournament.teams.filter((t) => t.id !== teamId),
    groups: [],
    matches: [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate fixtures from the current roster and format.
 * Replaces any existing groups/matches.
 */
export function generateFixtures(tournament: Tournament): Tournament {
  const { format, teams, groupCount } = tournament;

  if (teams.length < 2) {
    return {
      ...tournament,
      groups: [],
      matches: [],
      updatedAt: new Date().toISOString(),
    };
  }

  switch (format) {
    case "groups": {
      const { groups, matches } = generateGroupStage(teams, groupCount);
      return {
        ...tournament,
        groups,
        matches,
        updatedAt: new Date().toISOString(),
      };
    }
    case "knockout": {
      const matches = generateKnockoutBracket(teams);
      return {
        ...tournament,
        groups: [],
        matches,
        updatedAt: new Date().toISOString(),
      };
    }
    case "groups_knockout": {
      const { groups, matches: groupMatches } = generateGroupStage(
        teams,
        groupCount,
      );
      return {
        ...tournament,
        groups,
        matches: groupMatches,
        updatedAt: new Date().toISOString(),
      };
    }
    case "league": {
      const matches = generateRoundRobinMatches(teams);
      return {
        ...tournament,
        groups: [],
        matches,
        updatedAt: new Date().toISOString(),
      };
    }
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

/**
 * When all group matches are complete in a groups→knockout tournament,
 * build the knockout bracket from advancing teams.
 */
export function advanceFromGroups(tournament: Tournament): Tournament {
  if (tournament.format !== "groups_knockout") {
    return tournament;
  }

  const groupMatches = tournament.matches.filter((m) => m.stage === "group");
  const allComplete = groupMatches.every(
    (m) => m.homeScore !== null && m.awayScore !== null,
  );
  if (!allComplete || groupMatches.length === 0) {
    return tournament;
  }

  const advancing: Team[] = [];
  for (const group of tournament.groups) {
    const standings = computeStandings(
      group.teamIds,
      groupMatches.filter((m) => m.groupId === group.id),
    );
    const ids = topTeamIds(standings, tournament.advancePerGroup);
    for (const id of ids) {
      const team = tournament.teams.find((t) => t.id === id);
      if (team) {
        advancing.push(team);
      }
    }
  }

  if (advancing.length < 2) {
    return tournament;
  }

  const knockout = generateKnockoutBracket(advancing);
  return {
    ...tournament,
    matches: [...groupMatches, ...knockout],
    updatedAt: new Date().toISOString(),
  };
}

export function setMatchScore(
  tournament: Tournament,
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
): Tournament {
  const target = tournament.matches.find((m) => m.id === matchId);
  let matches: Tournament["matches"];

  if (target?.stage === "knockout") {
    matches = applyKnockoutScore(
      tournament.matches,
      matchId,
      homeScore,
      awayScore,
    );
  } else {
    matches = tournament.matches.map((m) =>
      m.id === matchId ? { ...m, homeScore, awayScore } : m,
    );
  }

  let next: Tournament = {
    ...tournament,
    matches,
    updatedAt: new Date().toISOString(),
  };

  if (next.format === "groups_knockout") {
    const hasKnockout = next.matches.some((m) => m.stage === "knockout");
    if (!hasKnockout) {
      next = advanceFromGroups(next);
    }
  }

  return next;
}
