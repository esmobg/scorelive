import { describe, expect, it } from "vitest";
import { createTranslator } from "@/i18n";
import {
  groupDisplayName,
  knockoutRoundLabel,
  localizeMatchLabel,
} from "@/lib/tournament/labels";
import { normalizeCountryCode, flagEmoji } from "@/lib/countries";
import type { Match } from "@/lib/tournament/types";

describe("i18n knockout labels", () => {
  it("returns Bulgarian and English round names", () => {
    expect(knockoutRoundLabel(2, "bg")).toBe("Финал");
    expect(knockoutRoundLabel(2, "en")).toBe("Final");
    expect(knockoutRoundLabel(8, "en")).toBe("Quarter-final");
  });

  it("localizes stored group labels", () => {
    const t = createTranslator("en");
    expect(groupDisplayName("Група A", t)).toBe("Group A");
    const match: Match = {
      id: "m1",
      stage: "group",
      round: 1,
      label: "Група A · Кръг 1",
      groupId: "g1",
      homeTeamId: "a",
      awayTeamId: "b",
      homeScore: null,
      awayScore: null,
    };
    expect(
      localizeMatchLabel(
        match,
        [{ id: "g1", name: "Група A", teamIds: [] }],
        t,
      ),
    ).toBe("Group A · Round 1");
  });
});

describe("countries", () => {
  it("normalizes and builds offline flags", () => {
    expect(normalizeCountryCode("bg")).toBe("BG");
    expect(normalizeCountryCode("")).toBe("BG");
    expect(flagEmoji("BG").length).toBeGreaterThan(0);
  });
});
