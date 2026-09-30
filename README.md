# ScoreLive

Open-source tournament platform for organizers, players, and fans. Create group stages, knockout brackets, league tables, or Swiss-system events, enter scores, and follow live standings — sport-agnostic, bilingual (BG/EN), WCAG 2.2 AAA-minded.

**Live demo:** [https://scorelive-app.vercel.app](https://scorelive-app.vercel.app) · **Repo:** [esmobg/turnyfly](https://github.com/esmobg/turnyfly)

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- **Turso (libSQL)** via `@libsql/client` + Drizzle ORM for users, tournaments, and favorites
- Seeded demo tournaments still hydrate from the client for public browsing
- Organizer session via HttpOnly HMAC cookie; passwords hashed with bcrypt
- Custom i18n dictionaries + React context (Bulgarian / English)
- Class-based dark theme (`.dark` + `--tf-*` tokens) with header toggle

## Requirements

- Node.js 20+
- npm 10+
- A Turso database for production / shared multi-browser demos (optional locally)

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Without Turso env vars, the API uses a local file database at `.data/scorelive.db`.

### Create a Turso database

```bash
# Install CLI: https://docs.turso.tech/cli/installation
turso auth login
turso db create scorelive
turso db show scorelive --url
turso db tokens create scorelive
```

Set on the Vercel project `scorelive` (Production + Preview):

| Variable | Notes |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://…` URL from `turso db show` |
| `TURSO_AUTH_TOKEN` | Token from `turso db tokens create` |
| `TURNYFLY_SESSION_SECRET` | **Required in production** (min 32 chars). Fail-closed if missing. |
| `DEMO_ADMIN_ENABLED` | Keep unset/`false` in production. |
| `NEXT_PUBLIC_SITE_URL` | `https://scorelive-app.vercel.app` |

```bash
printf '%s' "$TURSO_DATABASE_URL" | vercel env add TURSO_DATABASE_URL production --project scorelive
printf '%s' "$TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN production --project scorelive
vercel --prod --yes --project scorelive
```

Schema is applied automatically on first API use (`ensureSchema`).

### Demo admin (local / e2e only)

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `turnyfly-demo` |

Built-in demo admin is **enabled in local development** and **disabled on production** unless `DEMO_ADMIN_ENABLED=true`. Prefer registering at `/register` for shared demos.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Domain + DB + auth unit tests (Vitest) |
| `npm run test:e2e` | Playwright smoke tests |

## Features in this slice

- Discover home with demo tournaments + how-it-works / CTA sections
- Content pages: About, How it works, FAQ
- Organizer flow: register/login (Turso users), create tournament (DB), add teams, generate fixtures, enter scores
- Owner ACL on tournament PATCH/DELETE APIs
- Formats: groups, knockout, groups → knockout, league, **Swiss** (pairing by points, no rematches, bye, Buchholz)
- Favorites for logged-in users in Turso; guests keep localStorage + cookie sync
- Dark / light theme toggle (localStorage + `prefers-color-scheme`)
- Social footer + share controls + Open Graph / Twitter meta
- Security headers (CSP, frame denial, nosniff, referrer, permissions)
- Mobile-friendly header, scrollable tables, AAA contrast tokens in both themes

## Out of scope

OAuth, email password reset, payments, accelerated/Dutch Swiss variants, automatic migration of every old localStorage tournament, referee assignment, drag-drop scheduler, native apps, TV slideshow mode.

## License

MIT — see [LICENSE](./LICENSE).

## Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).
