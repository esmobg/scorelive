"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites-provider";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface FavoriteToggleProps {
  tournamentId: string;
  className?: string;
}

export function FavoriteToggle({
  tournamentId,
  className,
}: FavoriteToggleProps) {
  const { isFavorite, toggleFavorite, ready } = useFavorites();
  const { t } = useLocale();
  const active = isFavorite(tournamentId);

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--tf-line)] text-[var(--tf-ink)] transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] disabled:opacity-60",
        active && "border-[var(--tf-accent)] text-[var(--tf-accent-deep)]",
        className,
      )}
      aria-pressed={active}
      aria-label={active ? t("card.favoriteRemove") : t("card.favoriteAdd")}
      disabled={!ready}
      onClick={() => void toggleFavorite(tournamentId)}
    >
      <Heart
        className="size-5"
        fill={active ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}
