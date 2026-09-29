export type Locale = "bg" | "en";

export type MessageKey = import("./bg").MessageKey;

export type TranslateValues = Record<string, string | number>;

export type TranslateFn = (
  key: MessageKey,
  values?: TranslateValues,
) => string;
