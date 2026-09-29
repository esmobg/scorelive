# Turnyfly

Open-source tournament platform for organizers, players, and fans. Create group stages and knockout brackets, enter scores, and follow live standings — sport-agnostic, bilingual (BG/EN), WCAG 2.2 AAA-minded.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Client persistence via `localStorage` (v2) + seeded demo tournaments (no auth, payments, or database in this MVP)
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

- Discover home with demo tournaments
- Organizer flow: create tournament, add teams with nationality flags + optional logos, generate fixtures, enter scores
- Public tournament page: standings, knockout bracket, match list with TeamBadge (flag + logo/initials)
- Formats: groups (round-robin), knockout (single elimination), groups → knockout
- Header locale toggle; `html[lang]` follows BG/EN
- Accessibility shell: skip link, landmarks, focus styles, AAA contrast tokens, ≥44px targets, `aria-live` score/logo errors, `prefers-reduced-motion`

## Out of scope

Accounts, payments, multi-device sync, referee assignment, drag-drop scheduler, native apps, TV slideshow mode.

## License

MIT — see [LICENSE](./LICENSE).

## Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).
