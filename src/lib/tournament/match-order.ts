import type { Match, MatchStage } from "./types";

const STAGE_ORDER: Record<MatchStage, number> = {
  group: 0,
  swiss: 1,
  knockout: 2,
};

type MatchOrderInput = Omit<Match, "matchOrder"> & { matchOrder?: number };

function roundKey(match: MatchOrderInput): string {
  return `${match.stage}|${match.round}|${match.groupId ?? ""}`;
}

/**
 * Stable display order: stage → round → matchOrder → id.
 * Do not rely on array insertion order or createdAt.
 */
export function compareMatches(a: Match, b: Match): number {
  if (a.stage !== b.stage) {
    return STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
  }
  if (a.round !== b.round) {
    return a.round - b.round;
  }
  const orderA = a.matchOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.matchOrder ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return a.id.localeCompare(b.id);
}

export function sortMatches(matches: Match[]): Match[] {
  return [...matches].sort(compareMatches);
}

/**
 * Fill missing matchOrder deterministically within each stage/round/group.
 * Preserves existing matchOrder values; assigns 1..n by current relative order
 * (then id) for rows that lack it.
 */
export function ensureMatchOrders(matches: MatchOrderInput[]): Match[] {
  if (matches.length === 0) {
    return [];
  }

  const groups = new Map<string, MatchOrderInput[]>();
  for (const match of matches) {
    const key = roundKey(match);
    const list = groups.get(key);
    if (list) {
      list.push(match);
    } else {
      groups.set(key, [match]);
    }
  }

  const byId = new Map<string, number>();
  for (const list of groups.values()) {
    const ordered = [...list].sort((a, b) => {
      const orderA = a.matchOrder;
      const orderB = b.matchOrder;
      if (orderA != null && orderB != null && orderA !== orderB) {
        return orderA - orderB;
      }
      if (orderA != null && orderB == null) return -1;
      if (orderA == null && orderB != null) return 1;
      if (a.bracketSlot != null && b.bracketSlot != null) {
        return a.bracketSlot - b.bracketSlot;
      }
      return a.id.localeCompare(b.id);
    });
    ordered.forEach((match, index) => {
      byId.set(match.id, index + 1);
    });
  }

  return matches.map((match) => ({
    ...match,
    matchOrder: match.matchOrder ?? byId.get(match.id) ?? 1,
  }));
}

/** True when exactly one side is set (scheduled bye). */
export function isByeMatch(match: Match): boolean {
  return Boolean(match.homeTeamId) !== Boolean(match.awayTeamId);
}

export function byeParticipantId(match: Match): string | null {
  if (match.byeParticipantId) {
    return match.byeParticipantId;
  }
  if (match.homeTeamId && !match.awayTeamId) {
    return match.homeTeamId;
  }
  if (match.awayTeamId && !match.homeTeamId) {
    return match.awayTeamId;
  }
  return null;
}
