"use client";

import {
  countryDisplayName,
  flagEmoji,
  normalizeCountryCode,
} from "@/lib/countries";
import type { Team } from "@/lib/tournament";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface TeamBadgeProps {
  team: Pick<Team, "name" | "countryCode" | "logoDataUrl">;
  /** Compact layout for dense tables / brackets. */
  compact?: boolean;
  className?: string;
  /** Hide the team name (icon + flag only). */
  hideName?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function TeamBadge({
  team,
  compact = false,
  className,
  hideName = false,
}: TeamBadgeProps) {
  const { locale, t } = useLocale();
  const code = normalizeCountryCode(team.countryCode);
  const country = countryDisplayName(code, locale);
  const flag = flagEmoji(code);
  const logoAlt = t("team.logoAlt", { name: team.name });
  const flagAlt = t("team.flagAlt", { country });
  const initialsAlt = t("team.initialsFallback", { name: team.name });

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 text-[var(--tf-ink)]",
        compact ? "gap-1.5" : "gap-2",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--tf-line)] bg-[var(--tf-mist)] font-semibold text-[var(--tf-ink)]",
          compact ? "h-8 w-8 text-[0.65rem]" : "h-10 w-10 text-xs",
        )}
        aria-hidden={Boolean(team.logoDataUrl)}
      >
        {team.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL logos from localStorage
          <img
            src={team.logoDataUrl}
            alt={logoAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-label={initialsAlt}>{initials(team.name)}</span>
        )}
      </span>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded border border-[var(--tf-line)] bg-[var(--tf-foam)] px-1.5 font-medium tabular-nums text-[var(--tf-ink)]",
          compact ? "min-h-8 text-xs" : "min-h-9 text-sm",
        )}
        title={country}
        aria-label={flagAlt}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {flag}
        </span>
        <span className="font-semibold tracking-wide">{code}</span>
      </span>

      {hideName ? null : (
        <span
          className={cn(
            "min-w-0 truncate font-medium",
            compact ? "text-sm" : "text-base",
          )}
        >
          {team.name}
        </span>
      )}
    </span>
  );
}

export function findTeam(
  teams: Team[],
  id: string | null,
): Team | undefined {
  if (!id) return undefined;
  return teams.find((t) => t.id === id);
}
