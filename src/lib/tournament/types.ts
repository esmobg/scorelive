export type TournamentFormat =
  | "groups"
  | "knockout"
  | "groups_knockout"
  | "league";

export type MatchStage = "group" | "knockout";

export type MatchSlot = "home" | "away";

export interface Team {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "BG". */
  countryCode: string;
  /** Optional compressed image data URL stored in localStorage. */
  logoDataUrl?: string;
}

export interface AddTeamInput {
  name: string;
  countryCode: string;
  logoDataUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

export interface Match {
  id: string;
  stage: MatchStage;
  /** Round index within the stage (1-based). */
  round: number;
  /** Human-readable round label, e.g. "Група A · Кръг 1" or "1/4-финал". */
  label: string;
  groupId?: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  /** Position in the knockout bracket tree (0-based within round). */
  bracketSlot?: number;
  nextMatchId?: string;
  nextMatchSlot?: MatchSlot;
}

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  format: TournamentFormat;
  teams: Team[];
  groups: Group[];
  matches: Match[];
  /** Number of groups when format includes a group stage. */
  groupCount: number;
  /** Teams advancing from each group into knockout. */
  advancePerGroup: number;
  /**
   * Soft client-side owner (localStorage only). When set, organize mutations
   * should match the session username. Seed demos omit this. Residual risk:
   * any same-origin script can still rewrite localStorage (C4).
   */
  ownerUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface CreateTournamentInput {
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  format: TournamentFormat;
  groupCount?: number;
  advancePerGroup?: number;
  ownerUsername?: string;
}
