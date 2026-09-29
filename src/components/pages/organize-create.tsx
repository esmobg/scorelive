"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createEmptyTournament,
  type TournamentFormat,
} from "@/lib/tournament";
import { useTournamentStore } from "@/lib/storage/use-tournament-store";
import { formatLabel } from "@/i18n";
import { useLocale } from "@/i18n/locale-provider";
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

const formats: TournamentFormat[] = [
  "groups",
  "knockout",
  "groups_knockout",
  "league",
];

export function OrganizeCreatePage() {
  const router = useRouter();
  const { save, tournaments, ready } = useTournamentStore();
  const { t } = useLocale();
  const formId = useId();
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("groups_knockout");
  const [groupCount, setGroupCount] = useState("2");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !sport.trim() || !startDate || !endDate) {
      setError(t("organize.errorRequired"));
      return;
    }
    if (endDate < startDate) {
      setError(t("organize.errorDates"));
      return;
    }
    setError("");
    const tournament = createEmptyTournament({
      name,
      sport,
      startDate,
      endDate,
      format,
      groupCount: Number(groupCount) || 2,
      advancePerGroup: 2,
    });
    save(tournament);
    router.push(`/organize/${tournament.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)] sm:text-4xl">
          {t("organize.title")}
        </h1>
        <p className="text-[var(--tf-ink-muted)]">{t("organize.lead")}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)] p-5 sm:p-6"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-name`}>{t("organize.name")}</Label>
          <Input
            id={`${formId}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
            autoComplete="off"
            className="min-h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-sport`}>{t("organize.sport")}</Label>
          <Input
            id={`${formId}-sport`}
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            placeholder={t("organize.sportPlaceholder")}
            required
            aria-required="true"
            className="min-h-11"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-start`}>{t("organize.startDate")}</Label>
            <Input
              id={`${formId}-start`}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              aria-required="true"
              className="min-h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-end`}>{t("organize.endDate")}</Label>
            <Input
              id={`${formId}-end`}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              aria-required="true"
              className="min-h-11"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-format`}>{t("organize.format")}</Label>
          <Select
            value={format}
            onValueChange={(value) => {
              if (
                value === "groups" ||
                value === "knockout" ||
                value === "groups_knockout" ||
                value === "league"
              ) {
                setFormat(value);
              }
            }}
          >
            <SelectTrigger id={`${formId}-format`} className="w-full min-h-11">
              <SelectValue placeholder={t("organize.formatPlaceholder")}>
                {formatLabel(format, t)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {formats.map((f) => (
                <SelectItem key={f} value={f}>
                  {formatLabel(f, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {format === "groups" || format === "groups_knockout" ? (
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-groups`}>{t("organize.groupCount")}</Label>
            <Input
              id={`${formId}-groups`}
              type="number"
              min={1}
              max={8}
              value={groupCount}
              onChange={(e) => setGroupCount(e.target.value)}
              className="min-h-11"
            />
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm font-medium text-[var(--tf-danger)]">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="min-h-11">
          {t("organize.submit")}
        </Button>
      </form>

      <section aria-labelledby="existing-heading" className="space-y-3">
        <h2
          id="existing-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-semibold"
        >
          {t("organize.existingHeading")}
        </h2>
        {!ready ? (
          <p role="status">{t("organize.loading")}</p>
        ) : tournaments.length === 0 ? (
          <p className="text-[var(--tf-ink-muted)]">{t("organize.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {tournaments.map((tournament) => (
              <li key={tournament.id}>
                <Link
                  href={`/organize/${tournament.id}`}
                  className="inline-flex min-h-11 items-center font-medium underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                >
                  {tournament.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
