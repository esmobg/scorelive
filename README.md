# ScoreLive

Open-source tournament platform for organizers, players, and fans. Create group stages, knockout brackets, or a league table, enter scores, and follow live standings — sport-agnostic, bilingual (BG/EN), WCAG 2.2 AAA-minded.

**Live:** [https://turnyfly.vercel.app](https://turnyfly.vercel.app) · **Repo:** [esmobg/turnyfly](https://github.com/esmobg/turnyfly)

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Client persistence via `localStorage` (v2) + seeded demo tournaments
- Organizer session via HttpOnly cookie (username/password, bcrypt hash)
- Custom i18n dictionaries + React context (Bulgarian / English)

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
npm run dev -- --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Demo admin (local / demo only)

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `turnyfly-demo` |

These credentials unlock `/organize*` and score entry. You can also **register** a new organizer at `/register` (hashed password + session cookie). Public discovery, favorites, and content pages stay open. Do not reuse the demo password outside local/demo environments.

Optional env overrides:

- `TURNYFLY_ADMIN_USERNAME`
- `TURNYFLY_ADMIN_PASSWORD_HASH` (bcrypt)
- `TURNYFLY_SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL` (canonical URL for Open Graph; defaults to the Vercel project URL)

Storage keys keep the `turnyfly_*` prefix for demo compatibility.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Domain unit tests (Vitest) |
| `npm run test:e2e` | Playwright smoke tests |

## Features in this slice

- Discover home with demo tournaments + how-it-works / CTA sections
- Content pages: About, How it works, FAQ
- Organizer flow: login or register, create tournament, add teams, generate fixtures, enter scores
- Formats: groups, knockout, groups → knockout, **league** (single round-robin, 3/1/0, points → GD → GF)
- Favorites (heart toggle, `/favorites`, localStorage + session sync when logged in)
- Social footer SVG icons + share controls on public tournaments + Open Graph / Twitter meta
- Mobile-friendly header (hamburger drawer), scrollable tables, no page-level horizontal overflow
- Header locale toggle; `html[lang]` follows BG/EN
- Accessibility shell: skip link, landmarks, focus styles, AAA contrast tokens, ≥44px targets, `aria-live`, `prefers-reduced-motion`

## Out of scope

OAuth, email password reset, payments, cloud multi-user database sync, Swiss system, referee assignment, drag-drop scheduler, native apps, TV slideshow mode.

## License

MIT — see [LICENSE](./LICENSE).

## Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).
