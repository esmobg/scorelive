export interface SocialLink {
  id: "x" | "facebook" | "instagram" | "youtube";
  label: string;
  /** Placeholder until real handles exist. */
  href: string;
}

/**
 * Footer social destinations. Replace hrefs with real profile URLs when ready.
 */
export const socialLinks: SocialLink[] = [
  {
    id: "x",
    label: "X",
    href: "https://x.com/turnyfly",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/turnyfly",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/turnyfly",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@turnyfly",
  },
];

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function xShareUrl(url: string, text: string): string {
  const params = new URLSearchParams({
    url,
    text,
  });
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://turnyfly.vercel.app";
