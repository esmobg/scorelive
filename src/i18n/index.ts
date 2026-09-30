import { bg, type MessageKey, type Messages } from "./bg";
import { en } from "./en";
import type { Locale, TranslateFn, TranslateValues } from "./types";
import type { TournamentFormat } from "@/lib/tournament/types";

export const dictionaries: Record<Locale, Messages> = {
  bg,
  en,
};

export const LOCALE_STORAGE_KEY = "turnyfly.locale";

export function isLocale(value: unknown): value is Locale {
  return value === "bg" || value === "en";
}

export function interpolate(
  template: string,
  values?: TranslateValues,
): string {
  if (!values) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function createTranslator(locale: Locale): TranslateFn {
  const messages = dictionaries[locale];
  return (key: MessageKey, values?: TranslateValues) =>
    interpolate(messages[key], values);
}

export function formatLabel(
  format: TournamentFormat,
  t: TranslateFn,
): string {
  switch (format) {
    case "groups":
      return t("format.groups");
    case "knockout":
      return t("format.knockout");
    case "groups_knockout":
      return t("format.groups_knockout");
    case "league":
      return t("format.league");
    case "swiss":
      return t("format.swiss");
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export type { Locale, MessageKey, Messages, TranslateFn, TranslateValues };
