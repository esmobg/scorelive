import {
  addTeam,
  createEmptyTournament,
  generateFixtures,
  setMatchScore,
  type Team,
  type Tournament,
} from "@/lib/tournament";
import { coerceParticipantType } from "@/lib/api/tournament-payload";
import { normalizeCountryCode } from "@/lib/countries";

const STORAGE_KEY_V1 = "turnyfly.tournaments.v1";
const STORAGE_KEY_V2 = "turnyfly.tournaments.v2";

type RawTeam = Partial<Team> & { id?: string; name?: string };

function normalizeTeam(raw: RawTeam, index: number): Team | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) {
    return null;
  }
  const id =
    typeof raw.id === "string" && raw.id.trim()
      ? raw.id
      : `tm-migrated-${index}`;
  const team: Team = {
    id,
    name,
    countryCode: normalizeCountryCode(raw.countryCode),
  };
  if (
    typeof raw.logoDataUrl === "string" &&
    (raw.logoDataUrl.startsWith("data:image/png") ||
      raw.logoDataUrl.startsWith("data:image/jpeg") ||
      raw.logoDataUrl.startsWith("data:image/jpg") ||
      raw.logoDataUrl.startsWith("data:image/webp"))
  ) {
    team.logoDataUrl = raw.logoDataUrl;
  }
  return team;
}

function normalizeTournament(raw: unknown): Tournament | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const t = raw as Tournament & { teams?: RawTeam[]; participantType?: unknown };
  if (typeof t.id !== "string" || typeof t.name !== "string") {
    return null;
  }
  const teams = Array.isArray(t.teams)
    ? t.teams
        .map((team, i) => normalizeTeam(team, i))
        .filter((team): team is Team => Boolean(team))
    : [];
  const ownerUsername =
    typeof t.ownerUsername === "string" && t.ownerUsername.trim()
      ? t.ownerUsername.trim()
      : undefined;
  return {
    ...t,
    participantType: coerceParticipantType(t.participantType),
    teams,
    ...(ownerUsername ? { ownerUsername } : { ownerUsername: undefined }),
  };
}

function normalizeTournaments(raw: unknown): Tournament[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => normalizeTournament(item))
    .filter((item): item is Tournament => Boolean(item));
}

type SeedTeam = { name: string; countryCode: string };

function demoVolleyball(): Tournament {
  let t = createEmptyTournament({
    name: "Пролетна купа София",
    sport: "Волейбол",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    format: "groups_knockout",
    groupCount: 2,
    advancePerGroup: 2,
  });
  t = { ...t, id: "demo-volleyball" };

  const roster: SeedTeam[] = [
    { name: "Левски", countryCode: "BG" },
    { name: "ЦСКА", countryCode: "BG" },
    { name: "Марица", countryCode: "BG" },
    { name: "Берое", countryCode: "BG" },
    { name: "Славия", countryCode: "BG" },
    { name: "Локомотив", countryCode: "BG" },
    { name: "Хебър", countryCode: "BG" },
    { name: "Добруджа", countryCode: "RO" },
  ];
  for (const team of roster) {
    t = addTeam(t, team);
  }

  t = generateFixtures(t);

  const groupMatches = t.matches.filter((m) => m.stage === "group");
  if (groupMatches[0]) {
    t = setMatchScore(t, groupMatches[0].id, 3, 1);
  }
  if (groupMatches[1]) {
    t = setMatchScore(t, groupMatches[1].id, 3, 0);
  }
  if (groupMatches[2]) {
    t = setMatchScore(t, groupMatches[2].id, 2, 3);
  }

  return t;
}

function demoChessKnockout(): Tournament {
  let t = createEmptyTournament({
    name: "Блиц турнир Пловдив",
    sport: "Шахмат",
    startDate: "2026-05-01",
    endDate: "2026-05-01",
    format: "knockout",
  });
  t = { ...t, id: "demo-chess" };

  const roster: SeedTeam[] = [
    { name: "Иванов", countryCode: "BG" },
    { name: "Петрова", countryCode: "BG" },
    { name: "Георгиев", countryCode: "GR" },
    { name: "Николова", countryCode: "BG" },
    { name: "Димитров", countryCode: "RS" },
    { name: "Стоянова", countryCode: "BG" },
  ];
  for (const team of roster) {
    t = addTeam(t, team);
  }

  t = generateFixtures(t);
  const firstPlayable = t.matches.find(
    (m) =>
      m.stage === "knockout" &&
      m.homeTeamId &&
      m.awayTeamId &&
      m.homeScore === null,
  );
  if (firstPlayable) {
    t = setMatchScore(t, firstPlayable.id, 1, 0);
  }

  return t;
}

function demoFootballGroups(): Tournament {
  let t = createEmptyTournament({
    name: "Аматьорска лига Варна",
    sport: "Футбол",
    startDate: "2026-03-15",
    endDate: "2026-06-20",
    format: "groups",
    groupCount: 1,
  });
  t = { ...t, id: "demo-football" };

  const roster: SeedTeam[] = [
    { name: "Черно море юноши", countryCode: "BG" },
    { name: "Спартак аматьори", countryCode: "BG" },
    { name: "Калиакра", countryCode: "BG" },
    { name: "Аксаково", countryCode: "TR" },
  ];
  for (const team of roster) {
    t = addTeam(t, team);
  }

  t = generateFixtures(t);
  return t;
}

function demoLeagueChampionship(): Tournament {
  let t = createEmptyTournament({
    name: "Есенно първенство Бургас",
    sport: "Футбол",
    startDate: "2026-09-01",
    endDate: "2026-12-15",
    format: "league",
  });
  t = { ...t, id: "demo-league" };

  const roster: SeedTeam[] = [
    { name: "Нефтохимик", countryCode: "BG" },
    { name: "Черноморец", countryCode: "BG" },
    { name: "Поморие", countryCode: "BG" },
    { name: "Несебър", countryCode: "BG" },
    { name: "Созопол", countryCode: "BG" },
    { name: "Камено", countryCode: "BG" },
  ];
  for (const team of roster) {
    t = addTeam(t, team);
  }

  t = generateFixtures(t);
  const first = t.matches[0];
  const second = t.matches[1];
  if (first) {
    t = setMatchScore(t, first.id, 2, 1);
  }
  if (second) {
    t = setMatchScore(t, second.id, 0, 0);
  }
  return t;
}

function demoSwissOpen(): Tournament {
  let t = createEmptyTournament({
    name: "Швейцарска система Русе",
    sport: "Шахмат",
    startDate: "2026-10-01",
    endDate: "2026-10-03",
    format: "swiss",
    swissRounds: 3,
  });
  t = { ...t, id: "demo-swiss" };

  const roster: SeedTeam[] = [
    { name: "Александров", countryCode: "BG" },
    { name: "Борисова", countryCode: "BG" },
    { name: "Василев", countryCode: "BG" },
    { name: "Ганчева", countryCode: "RO" },
    { name: "Драганов", countryCode: "BG" },
    { name: "Еленова", countryCode: "RS" },
    { name: "Желев", countryCode: "BG" },
    { name: "Иванова", countryCode: "BG" },
  ];
  for (const team of roster) {
    t = addTeam(t, team);
  }

  t = generateFixtures(t);
  const playable = t.matches.filter((m) => m.homeTeamId && m.awayTeamId);
  if (playable[0]) {
    t = setMatchScore(t, playable[0].id, 1, 0);
  }
  if (playable[1]) {
    t = setMatchScore(t, playable[1].id, 1, 1);
  }
  return t;
}

export function getSeedTournaments(): Tournament[] {
  return [
    demoVolleyball(),
    demoChessKnockout(),
    demoFootballGroups(),
    demoLeagueChampionship(),
    demoSwissOpen(),
  ];
}

function persistV2(tournaments: Tournament[]): void {
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(tournaments));
  window.localStorage.removeItem(STORAGE_KEY_V1);
}

export function loadTournaments(): Tournament[] {
  if (typeof window === "undefined") {
    return getSeedTournaments();
  }

  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = normalizeTournaments(JSON.parse(rawV2));
      if (parsed.length > 0) {
        return parsed;
      }
    }

    const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const migrated = normalizeTournaments(JSON.parse(rawV1));
      if (migrated.length > 0) {
        persistV2(migrated);
        return migrated;
      }
    }

    const seed = getSeedTournaments();
    persistV2(seed);
    return seed;
  } catch {
    return getSeedTournaments();
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  if (typeof window === "undefined") {
    return;
  }
  persistV2(tournaments);
}

export function getTournament(id: string): Tournament | undefined {
  return loadTournaments().find((t) => t.id === id);
}

export function upsertTournament(tournament: Tournament): Tournament[] {
  const all = loadTournaments();
  const index = all.findIndex((t) => t.id === tournament.id);
  const next =
    index === -1
      ? [tournament, ...all]
      : all.map((t, i) => (i === index ? tournament : t));
  saveTournaments(next);
  return next;
}

export function deleteTournament(id: string): Tournament[] {
  const next = loadTournaments().filter((t) => t.id !== id);
  saveTournaments(next);
  return next;
}

export function resetToSeed(): Tournament[] {
  const seed = getSeedTournaments();
  saveTournaments(seed);
  return seed;
}

export const STORAGE_KEYS = {
  v1: STORAGE_KEY_V1,
  v2: STORAGE_KEY_V2,
} as const;
