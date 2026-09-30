import { describe, expect, it } from "vitest";
import {
  coerceParticipantType,
  isParticipantType,
  isTournamentPayload,
} from "./tournament-payload";

const base = {
  id: "t1",
  name: "Test",
  sport: "Chess",
  startDate: "2026-01-01",
  endDate: "2026-01-02",
  format: "league" as const,
  teams: [],
  groups: [],
  matches: [],
  groupCount: 1,
  advancePerGroup: 2,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("tournament payload participantType", () => {
  it("coerces missing and invalid values to team", () => {
    expect(coerceParticipantType(undefined)).toBe("team");
    expect(coerceParticipantType(null)).toBe("team");
    expect(coerceParticipantType("players")).toBe("team");
    expect(coerceParticipantType("team")).toBe("team");
    expect(coerceParticipantType("individual")).toBe("individual");
  });

  it("accepts legacy payloads without participantType", () => {
    expect(isTournamentPayload(base)).toBe(true);
    expect(isParticipantType((base as { participantType?: unknown }).participantType)).toBe(
      false,
    );
  });

  it("accepts individual and rejects invalid participantType", () => {
    expect(
      isTournamentPayload({ ...base, participantType: "individual" }),
    ).toBe(true);
    expect(isTournamentPayload({ ...base, participantType: "duo" })).toBe(
      false,
    );
  });
});
