export interface CountryOption {
  code: string;
  nameBg: string;
  nameEn: string;
}

/** Curated ISO 3166-1 alpha-2 list for tournament nationality. Offline only. */
export const COUNTRIES: CountryOption[] = [
  { code: "BG", nameBg: "България", nameEn: "Bulgaria" },
  { code: "AL", nameBg: "Албания", nameEn: "Albania" },
  { code: "AT", nameBg: "Австрия", nameEn: "Austria" },
  { code: "BA", nameBg: "Босна и Херцеговина", nameEn: "Bosnia and Herzegovina" },
  { code: "BE", nameBg: "Белгия", nameEn: "Belgium" },
  { code: "CH", nameBg: "Швейцария", nameEn: "Switzerland" },
  { code: "CY", nameBg: "Кипър", nameEn: "Cyprus" },
  { code: "CZ", nameBg: "Чехия", nameEn: "Czechia" },
  { code: "DE", nameBg: "Германия", nameEn: "Germany" },
  { code: "DK", nameBg: "Дания", nameEn: "Denmark" },
  { code: "EE", nameBg: "Естония", nameEn: "Estonia" },
  { code: "ES", nameBg: "Испания", nameEn: "Spain" },
  { code: "FI", nameBg: "Финландия", nameEn: "Finland" },
  { code: "FR", nameBg: "Франция", nameEn: "France" },
  { code: "GB", nameBg: "Великобритания", nameEn: "United Kingdom" },
  { code: "GE", nameBg: "Грузия", nameEn: "Georgia" },
  { code: "GR", nameBg: "Гърция", nameEn: "Greece" },
  { code: "HR", nameBg: "Хърватия", nameEn: "Croatia" },
  { code: "HU", nameBg: "Унгария", nameEn: "Hungary" },
  { code: "IE", nameBg: "Ирландия", nameEn: "Ireland" },
  { code: "IT", nameBg: "Италия", nameEn: "Italy" },
  { code: "LT", nameBg: "Литва", nameEn: "Lithuania" },
  { code: "LV", nameBg: "Латвия", nameEn: "Latvia" },
  { code: "MD", nameBg: "Молдова", nameEn: "Moldova" },
  { code: "ME", nameBg: "Черна гора", nameEn: "Montenegro" },
  { code: "MK", nameBg: "Северна Македония", nameEn: "North Macedonia" },
  { code: "NL", nameBg: "Нидерландия", nameEn: "Netherlands" },
  { code: "NO", nameBg: "Норвегия", nameEn: "Norway" },
  { code: "PL", nameBg: "Полша", nameEn: "Poland" },
  { code: "PT", nameBg: "Португалия", nameEn: "Portugal" },
  { code: "RO", nameBg: "Румъния", nameEn: "Romania" },
  { code: "RS", nameBg: "Сърбия", nameEn: "Serbia" },
  { code: "SE", nameBg: "Швеция", nameEn: "Sweden" },
  { code: "SI", nameBg: "Словения", nameEn: "Slovenia" },
  { code: "SK", nameBg: "Словакия", nameEn: "Slovakia" },
  { code: "TR", nameBg: "Турция", nameEn: "Türkiye" },
  { code: "UA", nameBg: "Украйна", nameEn: "Ukraine" },
  { code: "US", nameBg: "САЩ", nameEn: "United States" },
  { code: "XK", nameBg: "Косово", nameEn: "Kosovo" },
].sort((a, b) => a.nameEn.localeCompare(b.nameEn));

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

export function normalizeCountryCode(code: string | undefined | null): string {
  if (!code || typeof code !== "string") {
    return "BG";
  }
  const upper = code.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    return upper;
  }
  return "BG";
}

export function getCountry(code: string): CountryOption | undefined {
  return byCode.get(normalizeCountryCode(code));
}

export function countryDisplayName(
  code: string,
  locale: "bg" | "en",
): string {
  const country = getCountry(code);
  if (!country) {
    return normalizeCountryCode(code);
  }
  return locale === "bg" ? country.nameBg : country.nameEn;
}

/** Regional-indicator emoji flag from ISO alpha-2 (offline, no CDN). */
export function flagEmoji(countryCode: string): string {
  const code = normalizeCountryCode(countryCode);
  if (code === "XK") {
    // Kosovo has no official Unicode flag sequence in all runtimes — use letters.
    return "🇽🇰";
  }
  const A = 0x1f1e6;
  const chars = [...code].map((ch) =>
    String.fromCodePoint(A + (ch.charCodeAt(0) - 65)),
  );
  return chars.join("");
}
