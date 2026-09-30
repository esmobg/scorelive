# ScoreLive

Open-source tournament platform for organizers, players, and fans. Create group stages, knockout brackets, league tables, or Swiss-system events, enter scores, and follow live standings — sport-agnostic, bilingual (BG/EN), WCAG 2.2 AAA-minded.

**Live demo:** [https://scorelive-app.vercel.app](https://scorelive-app.vercel.app) · **Repo:** [esmobg/scorelive](https://github.com/esmobg/scorelive)

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
| `RESEND_API_KEY` | Optional. With a from address, password-reset emails go via Resend. **Unset today → log-only.** |
| `RESEND_FROM_EMAIL` | Preferred from address (e.g. `ScoreLive <noreply@…>`). Aliases: `RESEND_FROM`, `EMAIL_FROM`. |

```bash
printf '%s' "$TURSO_DATABASE_URL" | npx vercel env add TURSO_DATABASE_URL production --scope esmobgs-projects --project scorelive
printf '%s' "$TURSO_AUTH_TOKEN" | npx vercel env add TURSO_AUTH_TOKEN production --scope esmobgs-projects --project scorelive
npx vercel deploy --prod --yes --scope esmobgs-projects --project scorelive
```

Schema is applied automatically on first API use (`ensureSchema`).

### Password-reset email (Resend — optional, off by default)

Forgot/reset password works without Resend: tokens are stored hashed in Turso, and the one-time reset URL is written to **server logs** (Vercel → project `scorelive` → Logs). That is intentional production behavior until you add keys.

Exact env names to add later on Vercel (**Production + Preview**):

| Name | Required with | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | a from address | Resend API key |
| `RESEND_FROM_EMAIL` | `RESEND_API_KEY` | From address (preferred) |
| `RESEND_FROM` | `RESEND_API_KEY` | Alias for from |
| `EMAIL_FROM` | `RESEND_API_KEY` | Second from alias |

```bash
# Only when you have a real Resend key + verified sending domain — do not invent secrets.
printf '%s' 're_YOUR_KEY' | npx vercel env add RESEND_API_KEY production --scope esmobgs-projects --project scorelive
printf '%s' 're_YOUR_KEY' | npx vercel env add RESEND_API_KEY preview --scope esmobgs-projects --project scorelive
printf '%s' 'ScoreLive <noreply@your-domain>' | npx vercel env add RESEND_FROM_EMAIL production --scope esmobgs-projects --project scorelive
printf '%s' 'ScoreLive <noreply@your-domain>' | npx vercel env add RESEND_FROM_EMAIL preview --scope esmobgs-projects --project scorelive
npx vercel deploy --prod --yes --scope esmobgs-projects --project scorelive
```

Accounts registered with the optional email field can receive reset mail once Resend is configured. Username-only accounts still get a generic success response (no enumeration) and log-only delivery.

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
- Content pages: About, How it works, FAQ, Privacy, Terms
- Organizer flow: register/login (Turso users + revocable sessions), forgot/reset password, create tournament (DB), add teams, generate fixtures, enter scores
- Owner ACL on tournament PATCH/DELETE APIs (scores only via owner PATCH)
- Durable auth rate limits + `GET /api/health`
- Password reset tokens in Turso; Resend email when configured, otherwise server-log fallback
- Formats: groups, knockout, groups → knockout, league, **Swiss** (pairing by points, no rematches, bye, Buchholz)
- Favorites for logged-in users in Turso; guests keep localStorage + cookie sync
- Dark / light theme toggle (localStorage + `prefers-color-scheme`)
- Social footer + share controls + Open Graph / Twitter meta
- Security headers (CSP, frame denial, nosniff, referrer, permissions)
- Mobile-friendly header, scrollable tables, AAA contrast tokens in both themes

## Ops checklist (production)

| Item | Where |
| --- | --- |
| App + DB health | `GET /api/health` → `{ ok, db: "turso"\|"local"\|"down" }` |
| Request / error logs | Vercel project `scorelive` → Logs |
| Database console | [Turso dashboard](https://turso.tech) for the `scorelive` DB |
| Session revoke | Logout clears cookie **and** marks the `sessions` row revoked |
| Auth abuse | Turso `auth_rate_limits` — 10 login/register attempts per IP per minute |

### Env checklist (Vercel Production)

- `TURNYFLY_SESSION_SECRET` (min 32 chars; fail-closed)
- `TURSO_DATABASE_URL` (`libsql://…`)
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_SITE_URL` (`https://scorelive-app.vercel.app`)
- `DEMO_ADMIN_ENABLED` unset / `false`
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (or `RESEND_FROM` / `EMAIL_FROM`) — optional; **currently unset → password-reset links are log-only**

### Backup / restore (Turso)

1. In Turso dashboard or CLI, create a dump/snapshot of the production DB (`turso db shell scorelive .dump > scorelive-backup.sql` or platform dump).
2. Store the dump outside the app (encrypted object storage / secure disk).
3. To restore: create a new DB (or wipe), apply the dump, then point `TURSO_DATABASE_URL` / token at the restored DB and redeploy if the URL changed.
4. After restore, smoke-check `/api/health`, register/login, and an owned tournament PATCH.

Schema auto-migrates on first API use (`ensureSchema`) for new tables (`sessions`, `auth_rate_limits`).

## Out of scope

OAuth, payments, accelerated/Dutch Swiss variants, automatic migration of every old localStorage tournament, referee assignment, drag-drop scheduler, native apps, TV slideshow mode. (Password reset is in scope: email via Resend when configured, otherwise server-log delivery.)

## License

MIT — see [LICENSE](./LICENSE).

## Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).
