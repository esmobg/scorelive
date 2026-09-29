# Turnyfly

Open-source tournament platform for organizers, players, and fans. Create group stages, knockout brackets, or a league table, enter scores, and follow live standings — sport-agnostic, bilingual (BG/EN), WCAG 2.2 AAA-minded.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Client persistence via `localStorage` (v2) + seeded demo tournaments
- Admin session via HttpOnly cookie (username/password, bcrypt hash)
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

These credentials unlock `/organize*` and score entry. Public discovery, favorites, and content pages stay open. Do not reuse this password outside local/demo environments.

Optional env overrides:

- `TURNYFLY_ADMIN_USERNAME`
- `TURNYFLY_ADMIN_PASSWORD_HASH` (bcrypt)
- `TURNYFLY_SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL` (canonical URL for Open Graph)

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
- Organizer flow (admin login): create tournament, add teams, generate fixtures, enter scores
- Formats: groups, knockout, groups → knockout, **league** (single round-robin, 3/1/0, points → GD → GF)
- Favorites (heart toggle, `/favorites`, localStorage + session sync when logged in)
- Social footer links + share controls on public tournaments + Open Graph / Twitter meta
- Header locale toggle; `html[lang]` follows BG/EN
- Accessibility shell: skip link, landmarks, focus styles, AAA contrast tokens, ≥44px targets, `aria-live`, `prefers-reduced-motion`

## Out of scope

OAuth, email password reset, payments, cloud multi-user database sync, Swiss system, referee assignment, drag-drop scheduler, native apps, TV slideshow mode.

## License

MIT — see [LICENSE](./LICENSE).

## Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).
