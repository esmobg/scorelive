import {
  addTeam,
  createEmptyTournament,
  generateFixtures,
  setMatchScore,
  type Tournament,
} from "@/lib/tournament";

const STORAGE_KEY = "turnyfly.tournaments.v1";

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

  for (const name of [
    "Левски",
    "ЦСКА",
    "Марица",
    "Берое",
    "Славия",
    "Локомотив",
    "Хебър",
    "Добруджа",
  ]) {
    t = addTeam(t, name);
  }

  t = generateFixtures(t);

  // Seed a few group scores so standings look alive
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

  for (const name of [
    "Иванов",
    "Петрова",
    "Георгиев",
    "Николова",
    "Димитров",
    "Стоянова",
  ]) {
    t = addTeam(t, name);
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

  for (const name of [
    "Черно море юноши",
    "Спартак аматьори",
    "Калиакра",
    "Аксаково",
  ]) {
    t = addTeam(t, name);
  }

  t = generateFixtures(t);
  return t;
}

export function getSeedTournaments(): Tournament[] {
  return [demoVolleyball(), demoChessKnockout(), demoFootballGroups()];
}

export function loadTournaments(): Tournament[] {
  if (typeof window === "undefined") {
    return getSeedTournaments();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedTournaments();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Tournament[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = getSeedTournaments();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return getSeedTournaments();
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
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
