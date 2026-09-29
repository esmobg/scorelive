import type { Locale } from "@/i18n";
import { createTranslator, type TranslateFn } from "@/i18n";
import type { Group, Match } from "@/lib/tournament/types";

export function knockoutRoundLabelFor(
  teamsInRound: number,
  t: TranslateFn,
): string {
  if (teamsInRound <= 2) return t("knockout.final");
  if (teamsInRound <= 4) return t("knockout.semi");
  if (teamsInRound <= 8) return t("knockout.quarter");
  if (teamsInRound <= 16) return t("knockout.eighth");
  return t("knockout.roundOf", { count: teamsInRound });
}

/** Locale-aware label used when generating fixtures (stored for legacy readers). */
export function knockoutRoundLabel(
  teamsInRound: number,
  locale: Locale = "bg",
): string {
  return knockoutRoundLabelFor(teamsInRound, createTranslator(locale));
}

export function groupDisplayName(name: string, t: TranslateFn): string {
  const match = name.match(/^(?:Група|Group)\s+(.+)$/i);
  if (match) {
    return t("group.name", { letter: match[1] });
  }
  if (/^[A-Z]$/i.test(name.trim())) {
    return t("group.name", { letter: name.trim().toUpperCase() });
  }
  return name;
}

function legacyKnockoutLabel(label: string, t: TranslateFn): string | null {
  const map: Record<string, string> = {
    Финал: t("knockout.final"),
    Final: t("knockout.final"),
    "1/2-финал": t("knockout.semi"),
    "Semi-final": t("knockout.semi"),
    "1/4-финал": t("knockout.quarter"),
    "Quarter-final": t("knockout.quarter"),
    "1/8-финал": t("knockout.eighth"),
    "Round of 16": t("knockout.eighth"),
  };
  if (map[label]) {
    return map[label];
  }
  const bgRound = label.match(/^Рунд на (\d+)$/);
  if (bgRound) {
    return t("knockout.roundOf", { count: Number(bgRound[1]) });
  }
  const enRound = label.match(/^Round of (\d+)$/i);
  if (enRound) {
    return t("knockout.roundOf", { count: Number(enRound[1]) });
  }
  return null;
}

function legacyGroupRoundLabel(label: string, t: TranslateFn): string | null {
  const m = label.match(
    /^(?:Група|Group)\s+(.+?)\s*[·•-]\s*(?:Кръг|Round)\s+(\d+)$/i,
  );
  if (m) {
    return t("match.groupRound", {
      group: t("group.name", { letter: m[1] }),
      round: Number(m[2]),
    });
  }
  const roundOnly = label.match(/^(?:Кръг|Round)\s+(\d+)$/i);
  if (roundOnly) {
    return t("match.roundOnly", { round: Number(roundOnly[1]) });
  }
  return null;
}

/**
 * Display a match label in the active locale, using structure when available
 * and falling back to translating stored Bulgarian/English strings.
 */
export function localizeMatchLabel(
  match: Match,
  groups: Group[],
  t: TranslateFn,
  knockoutTeamsInRound?: number,
): string {
  if (match.stage === "group") {
    const group = groups.find((g) => g.id === match.groupId);
    if (group) {
      return t("match.groupRound", {
        group: groupDisplayName(group.name, t),
        round: match.round,
      });
    }
    return (
      legacyGroupRoundLabel(match.label, t) ??
      t("match.roundOnly", { round: match.round })
    );
  }

  if (knockoutTeamsInRound) {
    return knockoutRoundLabelFor(knockoutTeamsInRound, t);
  }

  return legacyKnockoutLabel(match.label, t) ?? match.label;
}
