# Accessibility statement — Turnyfly

Turnyfly aims for **WCAG 2.2 Level AAA** for the MVP surfaces (discover, organize, public tournament).

## What we ship

| Area | Approach |
| --- | --- |
| Language | Document `lang="bg"` |
| Skip link | “Към основното съдържание” jumps to `#main-content` |
| Landmarks | `header`, `nav`, `main`, `footer`; labelled sections |
| Focus | Visible 3px accent outline; focus order follows visual order |
| Contrast | Body text tokens target ≥ 7:1 (`--tf-ink` on mist/foam backgrounds) |
| Controls | Native `<button>` / `<a>` / labelled inputs; 44px-class touch targets on primary actions |
| Tables | Standings use `<table>` with column headers |
| Live updates | Score saves announce via polite `aria-live` |
| Motion | Decorative hero motion disabled under `prefers-reduced-motion` |
| Keyboard | Create tournament, add teams, generate fixtures, and score entry are keyboard operable |

## Checklist (manual)

- [ ] Tab from browser chrome reaches skip link, then header, then main
- [ ] Create tournament form shows errors in a `role="alert"` region
- [ ] Score entry errors are announced; successful saves update the live region
- [ ] Bracket and match lists are reachable without a pointer
- [ ] Zoom to 200% — content reflows without horizontal page scroll (bracket may scroll locally)

## Known MVP limits

- Knockout draws are rejected (must pick a winner) — communicated as an inline alert
- Demo data lives in `localStorage` only (no multi-user sync)
- Third-party browser extensions may affect focus order

## Feedback

File an issue in the repository describing the page, assistive tech, and expected vs actual behavior.
