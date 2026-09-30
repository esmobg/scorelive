import type {
  ParticipantType,
  Tournament,
  TournamentFormat,
} from "@/lib/tournament/types";

const FORMATS: TournamentFormat[] = [
  "groups",
  "knockout",
  "groups_knockout",
  "league",
  "swiss",
];

export function isTournamentFormat(value: unknown): value is TournamentFormat {
  return (
    typeof value === "string" &&
    (FORMATS as string[]).includes(value)
  );
}

export function isParticipantType(value: unknown): value is ParticipantType {
  return value === "team" || value === "individual";
}

/** Legacy / missing field → team for back-compat. */
export function coerceParticipantType(value: unknown): ParticipantType {
  return isParticipantType(value) ? value : "team";
}

export function isTournamentPayload(value: unknown): value is Tournament {
  if (!value || typeof value !== "object") {
    return false;
  }
  const t = value as Tournament & { participantType?: unknown };
  if (
    t.participantType !== undefined &&
    !isParticipantType(t.participantType)
  ) {
    return false;
  }
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    typeof t.sport === "string" &&
    typeof t.startDate === "string" &&
    typeof t.endDate === "string" &&
    isTournamentFormat(t.format) &&
    Array.isArray(t.teams) &&
    Array.isArray(t.groups) &&
    Array.isArray(t.matches)
  );
}
