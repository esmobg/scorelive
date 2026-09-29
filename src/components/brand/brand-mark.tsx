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
  lg: "h-14 w-14 sm:h-16 sm:w-16",
} as const;

const wordSizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-5xl sm:text-7xl",
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
          d="M14 20h36v6.5H36.2V44h-8.4V26.5H14V20z"
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
          Turnyfly
        </span>
      ) : null}
    </span>
  );
}
