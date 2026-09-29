export interface SocialLink {
  id: "x" | "facebook" | "instagram" | "youtube";
  label: string;
  /** Accessible name for the icon control. */
  ariaLabel: string;
  /** Placeholder until real handles exist. */
  href: string;
  /** SVG path `d` attribute(s) for a 24×24 viewBox icon. */
  paths: string[];
}

/**
 * Footer social destinations. Replace hrefs with real profile URLs when ready.
 * Icons are inline SVG paths for AAA contrast (currentColor) and ≥44px targets.
 */
export const socialLinks: SocialLink[] = [
  {
    id: "x",
    label: "X",
    ariaLabel: "ScoreLive on X",
    href: "https://x.com/scorelive",
    paths: [
      "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    ariaLabel: "ScoreLive on Facebook",
    href: "https://www.facebook.com/scorelive",
    paths: [
      "M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.84c0-2.37 1.4-3.68 3.56-3.68 1.03 0 2.11.18 2.11.18v2.32h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.9h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z",
    ],
  },
  {
    id: "instagram",
    label: "Instagram",
    ariaLabel: "ScoreLive on Instagram",
    href: "https://www.instagram.com/scorelive",
    paths: [
      "M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5z",
      "M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
      "M17.5 6.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z",
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    ariaLabel: "ScoreLive on YouTube",
    href: "https://www.youtube.com/@scorelive",
    paths: [
      "M23.5 6.2a3.05 3.05 0 0 0-2.15-2.16C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.35.54A3.05 3.05 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3.05 3.05 0 0 0 2.15 2.16C4.5 20.5 12 20.5 12 20.5s7.5 0 9.35-.54a3.05 3.05 0 0 0 2.15-2.16A31.9 31.9 0 0 0 24 12a31.9 31.9 0 0 0-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z",
    ],
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
