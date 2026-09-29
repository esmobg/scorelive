# Accessibility statement — Turnyfly

Turnyfly aims for **WCAG 2.2 Level AAA** for the MVP surfaces (discover, organize, public tournament).

## What we ship

| Area | Approach |
| --- | --- |
| Language | Document `lang` switches with the BG/EN locale toggle (`bg` / `en`) |
| Skip link | Localized skip link jumps to `#main-content` |
| Landmarks | `header`, `nav`, `main`, `footer`; labelled sections |
| Focus | Visible 3px accent outline; focus order follows visual order |
| Contrast | Body text tokens target ≥ 7:1 (`--tf-ink` on mist/foam backgrounds) |
| Controls | Native `<button>` / `<a>` / labelled inputs; ≥44px touch targets on primary actions and tabs |
| Tables | Standings use `<table>` with column headers |
| Live updates | Score saves and logo upload errors announce via polite `aria-live` |
| Motion | Decorative hero motion disabled under `prefers-reduced-motion` |
| Team identity | Flags include ISO code + country name in `aria-label` (not color alone); logos use team-name alt text |
| Keyboard | Create tournament, add teams (country + logo), generate fixtures, and score entry are keyboard operable |

## Checklist (manual)

- [ ] Tab from browser chrome reaches skip link, then header, then main
- [ ] Create tournament form shows errors in a `role="alert"` region
- [ ] Score entry errors are announced; successful saves update the live region
- [ ] Logo upload failures announce via `aria-live`
- [ ] Locale toggle updates visible copy and `html[lang]`
- [ ] Bracket and match lists are reachable without a pointer
- [ ] Zoom to 200% — content reflows without horizontal page scroll (bracket may scroll locally)

## Known MVP limits

- Knockout draws are rejected (must pick a winner) — communicated as an inline alert
- Demo data lives in `localStorage` only (no multi-user sync)
- Third-party browser extensions may affect focus order
- Flag glyphs depend on OS emoji fonts; ISO code remains the non-color cue

## Feedback

File an issue in the repository describing the page, assistive tech, and expected vs actual behavior.
