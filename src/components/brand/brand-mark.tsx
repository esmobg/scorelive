import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  /** Show wordmark beside the mark. */
  withWordmark?: boolean;
  /** Accessible label for the mark SVG. */
  markAlt: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12 sm:h-16 sm:w-16",
} as const;

const wordSizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl sm:text-7xl",
} as const;

export function BrandMark({
  className,
  withWordmark = true,
  markAlt,
  size = "md",
}: BrandMarkProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 text-[var(--tf-ink)]", className)}
    >
      <svg
        className={cn("shrink-0", sizes[size])}
        viewBox="0 0 64 64"
        role="img"
        aria-label={markAlt}
      >
        <rect width="64" height="64" rx="14" fill="var(--tf-accent-deep)" />
        <path
          d="M40.8 22.2c0-4.2-3.6-7-9.4-7-6.8 0-11.2 3.5-11.8 8.8h6.8c.4-2.1 2.3-3.4 5-3.4 2.5 0 4.1 1.1 4.1 2.9 0 1.7-1.1 2.6-4.9 3.8-6.4 2-11.6 4.6-11.6 11 0 4.9 4 8.6 10.6 8.6 7.1 0 11.9-3.7 12.7-9.3h-6.9c-.5 2.4-2.7 3.9-5.8 3.9-2.8 0-4.7-1.3-4.7-3.3 0-2 1.5-3 5.9-4.4 6.1-2 11.1-4.7 11.1-11.4z"
          fill="var(--tf-foam)"
        />
        <path
          d="M18 46.5c6.5-7 13-10.5 21.5-12.5 3.2 4.2 6.8 7.4 12.5 10.2-8.8 1.8-16.6 2.2-25.2 1.1-3.1-.4-6.1-.9-8.8-1.8z"
          fill="var(--tf-glow)"
          opacity="0.95"
        />
      </svg>
      {withWordmark ? (
        <span
          className={cn(
            "font-[family-name:var(--font-display)] font-semibold tracking-tight",
            wordSizes[size],
          )}
        >
          ScoreLive
        </span>
      ) : null}
    </span>
  );
}
