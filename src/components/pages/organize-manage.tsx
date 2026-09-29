"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  addTeam,
  generateFixtures,
  removeTeam,
  setMatchScore,
} from "@/lib/tournament";
import { COUNTRIES, countryDisplayName } from "@/lib/countries";
import { compressLogoFile } from "@/lib/logo-compress";
import { useAuth } from "@/lib/auth/auth-provider";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import type { Tournament } from "@/lib/tournament";
import { formatLabel } from "@/i18n";
import { useLocale } from "@/i18n/locale-provider";
import { LiveScoreRegion } from "@/components/a11y/live-score-region";
import { ScoreEntryForm } from "@/components/tournament/score-entry-form";
import { MatchList } from "@/components/tournament/match-list";
import { TeamBadge } from "@/components/tournament/team-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Soft ACL: seed demos (no owner) stay editable; owned tournaments require match. */
function canMutateTournament(
  tournament: Tournament,
  username: string | null,
): boolean {
  if (!tournament.ownerUsername) {
    return true;
  }
  return Boolean(username) && tournament.ownerUsername === username;
}

export function OrganizeManagePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { getById, save, ready } = useTournamentStore();
  const { username } = useAuth();
  const tournament = getById(id);
  const { locale, t } = useLocale();
  const [teamName, setTeamName] = useState("");
  const [countryCode, setCountryCode] = useState("BG");
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();
  const [logoStatus, setLogoStatus] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [formError, setFormError] = useState("");

  const pendingMatches = useMemo(() => {
    if (!tournament) return [];
    return tournament.matches.filter(
      (m) =>
        m.homeTeamId &&
        m.awayTeamId &&
        (m.homeScore === null || m.awayScore === null),
    );
  }, [tournament]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p role="status">{t("manage.loading")}</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <Alert>
          <AlertTitle>{t("manage.notFoundTitle")}</AlertTitle>
          <AlertDescription>{t("manage.notFoundBody")}</AlertDescription>
        </Alert>
        <Link
          href="/organize"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("manage.backOrganize")}
        </Link>
      </div>
    );
  }

  if (!canMutateTournament(tournament, username)) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <Alert>
          <AlertTitle>{t("manage.forbiddenTitle")}</AlertTitle>
          <AlertDescription>{t("manage.forbiddenBody")}</AlertDescription>
        </Alert>
        <Link
          href="/organize"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("manage.backOrganize")}
        </Link>
      </div>
    );
  }

  async function handleLogoChange(file: File | null) {
    if (!file) {
      setLogoDataUrl(undefined);
      setLogoStatus("");
      return;
    }
    const result = await compressLogoFile(file);
    if (!result.ok) {
      const message =
        result.error === "type"
          ? t("manage.errorLogoType")
          : result.error === "size"
            ? t("manage.errorLogoSize")
            : t("manage.errorLogoRead");
      setLogoStatus(message);
      setLogoDataUrl(undefined);
      return;
    }
    setLogoDataUrl(result.dataUrl);
    setLogoStatus("");
  }

  function handleAddTeam(event: React.FormEvent) {
    event.preventDefault();
    if (!teamName.trim()) {
      setFormError(t("manage.errorTeamName"));
      return;
    }
    if (!countryCode) {
      setFormError(t("manage.errorCountry"));
      return;
    }
    setFormError("");
    save(
      addTeam(tournament!, {
        name: teamName,
        countryCode,
        logoDataUrl,
      }),
    );
    setTeamName("");
    setLogoDataUrl(undefined);
    setLogoStatus("");
  }

  function handleGenerate() {
    if (tournament!.teams.length < 2) {
      setFormError(t("manage.errorMinTeams"));
      return;
    }
    setFormError("");
    save(generateFixtures(tournament!));
    setLiveMessage(t("manage.fixturesGenerated"));
  }

  async function handleScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
  ) {
    const authRes = await fetch("/api/scores/authorize", {
      method: "POST",
      credentials: "include",
    });
    if (!authRes.ok) {
      window.location.href = `/login?next=${encodeURIComponent(`/organize/${id}`)}`;
      return;
    }
    const match = tournament!.matches.find((m) => m.id === matchId);
    const next = setMatchScore(tournament!, matchId, homeScore, awayScore);
    save(next);
    const home =
      tournament!.teams.find((team) => team.id === match?.homeTeamId)?.name ??
      "";
    const away =
      tournament!.teams.find((team) => team.id === match?.awayTeamId)?.name ??
      "";
    setLiveMessage(
      t("manage.scoreUpdated", {
        home,
        homeScore,
        awayScore,
        away,
      }),
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <LiveScoreRegion message={liveMessage} />

      <header className="space-y-2">
        <p className="text-sm font-medium text-[var(--tf-ink-muted)]">
          {tournament.sport} · {formatLabel(tournament.format, t)}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {tournament.name}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">
          {tournament.startDate} — {tournament.endDate}
        </p>
        <p>
          <Link
            href={`/tournaments/${tournament.id}`}
            className="inline-flex min-h-11 items-center font-semibold text-[var(--tf-accent-deep)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            {t("manage.publicLink")}
          </Link>
        </p>
      </header>

      <Tabs defaultValue="teams">
        <TabsList aria-label={t("manage.tabsLabel")}>
          <TabsTrigger value="teams">{t("manage.tabTeams")}</TabsTrigger>
          <TabsTrigger value="fixtures">{t("manage.tabFixtures")}</TabsTrigger>
          <TabsTrigger value="scores">{t("manage.tabScores")}</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4 pt-4">
          <form onSubmit={handleAddTeam} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="team-name">{t("manage.teamName")}</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  autoComplete="off"
                  className="min-h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team-country">{t("manage.country")}</Label>
                <Select
                  value={countryCode}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      setCountryCode(value);
                    }
                  }}
                >
                  <SelectTrigger id="team-country" className="w-full min-h-11">
                    <SelectValue>
                      {countryDisplayName(countryCode, locale)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {locale === "bg" ? country.nameBg : country.nameEn} (
                        {country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="team-logo">{t("manage.logo")}</Label>
              <Input
                id="team-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="min-h-11 cursor-pointer pt-2"
                onChange={(e) => {
                  void handleLogoChange(e.target.files?.[0] ?? null);
                }}
              />
              <p className="text-xs text-[var(--tf-ink-muted)]">
                {t("manage.logoHelp")}
              </p>
              <div aria-live="polite" className="min-h-5 text-sm font-medium text-[var(--tf-danger)]">
                {logoStatus}
              </div>
              {logoDataUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoDataUrl}
                    alt=""
                    className="h-11 w-11 rounded-md border border-[var(--tf-line)] object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => {
                      setLogoDataUrl(undefined);
                      setLogoStatus("");
                    }}
                  >
                    {t("manage.logoClear")}
                  </Button>
                </div>
              ) : null}
            </div>

            <Button type="submit" className="min-h-11">
              {t("manage.addTeam")}
            </Button>
          </form>

          {formError ? (
            <p role="alert" className="text-sm font-medium text-[var(--tf-danger)]">
              {formError}
            </p>
          ) : null}

          {tournament.teams.length === 0 ? (
            <p className="text-[var(--tf-ink-muted)]">{t("manage.noTeams")}</p>
          ) : (
            <ul className="divide-y divide-[var(--tf-line)] rounded-lg border border-[var(--tf-line)] bg-[var(--tf-foam)]">
              {tournament.teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <TeamBadge team={team} />
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => save(removeTeam(tournament, team.id))}
                  >
                    {t("manage.removeTeam")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button type="button" onClick={handleGenerate} className="min-h-11">
            {t("manage.generate")}
          </Button>
        </TabsContent>

        <TabsContent value="fixtures" className="space-y-4 pt-4">
          <MatchList
            matches={tournament.matches}
            teams={tournament.teams}
            groups={tournament.groups}
            emptyMessage={t("manage.fixturesEmpty")}
          />
        </TabsContent>

        <TabsContent value="scores" className="space-y-4 pt-4">
          {pendingMatches.length === 0 ? (
            <p className="text-[var(--tf-ink-muted)]">
              {tournament.matches.length === 0
                ? t("manage.scoresNeedFixtures")
                : t("manage.scoresAllDone")}
            </p>
          ) : null}
          <div className="space-y-4">
            {(pendingMatches.length > 0
              ? pendingMatches
              : tournament.matches.filter((m) => m.homeTeamId && m.awayTeamId)
            ).map((match) => (
              <ScoreEntryForm
                key={`${match.id}-${match.homeScore}-${match.awayScore}`}
                match={match}
                teams={tournament.teams}
                groups={tournament.groups}
                onSave={handleScore}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
