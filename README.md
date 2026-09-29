# ScoreLive

Open-source tournament platform for organizers, players, and fans. Create group stages, knockout brackets, or a league table, enter scores, and follow live standings — sport-agnostic, bilingual (BG/EN), WCAG 2.2 AAA-minded.

**Live demo:** [https://scorelive-app.vercel.app](https://scorelive-app.vercel.app) · **Repo:** [esmobg/turnyfly](https://github.com/esmobg/turnyfly)

> Public production is a **demo / MVP**. Tournament data is still browser `localStorage` (no shared DB). Treat the live URL as a public demo, not multi-user production.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Client persistence via `localStorage` (v2) + seeded demo tournaments
- Organizer session via HttpOnly cookie (HMAC session token; bcrypt passwords)
- Organizer registry cookie is **HMAC-sealed** (clients cannot forge password hashes)
- Custom i18n dictionaries + React context (Bulgarian / English)

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env.local   # optional; see env vars below
npm run dev -- --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Demo admin (local / e2e only)

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `turnyfly-demo` |

Built-in demo admin is **enabled in local development** and **disabled on production** unless `DEMO_ADMIN_ENABLED=true`. Do **not** publish live credentials for the production URL. Prefer registering a new organizer at `/register` for demos.

Required / important env vars:

| Variable | Notes |
| --- | --- |
| `TURNYFLY_SESSION_SECRET` | **Required in production** (min 32 chars). Fail-closed if missing. |
| `DEMO_ADMIN_ENABLED` | Set `true` only for local/e2e (or a private demo). Off by default in production. |
| `TURNYFLY_ADMIN_USERNAME` | Optional override for demo admin username |
| `TURNYFLY_ADMIN_PASSWORD_HASH` | Optional bcrypt hash override |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (production: `https://scorelive-app.vercel.app`) |

Storage keys keep the `turnyfly_*` prefix for demo compatibility.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Domain + auth unit tests (Vitest) |
| `npm run test:e2e` | Playwright smoke tests (`DEMO_ADMIN_ENABLED` + session secret injected) |

## Features in this slice

- Discover home with demo tournaments + how-it-works / CTA sections
- Content pages: About, How it works, FAQ
- Organizer flow: login or register, create tournament, add teams, generate fixtures, enter scores
- Soft client ownership (`ownerUsername`) on newly created tournaments — still localStorage
- Formats: groups, knockout, groups → knockout, **league** (single round-robin, 3/1/0, points → GD → GF)
- Favorites (heart toggle, `/favorites`, capped list, localStorage + session sync when logged in)
- Social footer SVG icons + share controls on public tournaments + Open Graph / Twitter meta
- Security headers (CSP, frame denial, nosniff, referrer, permissions)
- Mobile-friendly header (hamburger drawer), scrollable tables, no page-level horizontal overflow
- Header locale toggle; `html[lang]` follows BG/EN
- Accessibility shell: skip link, landmarks, focus styles, AAA contrast tokens, ≥44px targets, `aria-live`, `prefers-reduced-motion`

## Out of scope

OAuth, email password reset, payments, cloud multi-user database sync (see C4 gap), Swiss system, referee assignment, drag-drop scheduler, native apps, TV slideshow mode.

## License

MIT — see [LICENSE](./LICENSE).

## Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).
