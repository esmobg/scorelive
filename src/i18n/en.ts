import type { Messages } from "./bg";

export const en = {
  "meta.title": "ScoreLive — tournament platform",
  "meta.description":
    "Open tournament platform: organize groups, knockouts, and leagues, enter scores, and follow standings.",

  "brand.name": "ScoreLive",
  "brand.tagline": "ScoreLive — open tournament platform. MIT license.",
  "brand.markAlt": "ScoreLive logo",

  "nav.home": "Home",
  "nav.organize": "Organize",
  "nav.favorites": "Favorites",
  "nav.about": "About",
  "nav.howItWorks": "How it works",
  "nav.faq": "FAQ",
  "nav.login": "Log in",
  "nav.register": "Register",
  "nav.logout": "Log out",
  "nav.main": "Main navigation",
  "nav.footer": "Secondary navigation",
  "nav.social": "Social networks",
  "nav.accessibility": "Accessibility",
  "nav.privacy": "Privacy",
  "nav.terms": "Terms",
  "nav.skip": "Skip to main content",
  "nav.menuOpen": "Open menu",
  "nav.menuClose": "Close menu",

  "locale.label": "Language",
  "locale.bg": "Български",
  "locale.en": "English",
  "locale.switchTo": "Language: {label}",

  "home.heroTitle": "Tournaments for organizers, players, and fans",
  "home.heroLead":
    "Build groups, knockouts, or a league table, enter scores, and share live standings — accessibility from day one.",
  "home.ctaOrganize": "Organize a tournament",
  "home.ctaFollow": "Follow tournaments",
  "home.tournamentsHeading": "Tournaments",
  "home.tournamentsLead":
    "Demo tournaments load locally; organizer tournaments sync from the shared database.",
  "home.resetDemo": "Restore demo",
  "home.loading": "Loading tournaments…",
  "home.emptyTitle": "No tournaments",
  "home.emptyBody": "Create your first tournament or restore the demo data.",
  "home.howHeading": "How it works",
  "home.howLead":
    "Three steps from idea to live standings — no paid plans.",
  "home.howStep1Title": "Pick a format",
  "home.howStep1Body":
    "Choose groups, knockout, both, league, or Swiss system.",
  "home.howStep2Title": "Add teams and scores",
  "home.howStep2Body":
    "Enter participants, generate fixtures, and keep results up to date.",
  "home.howStep3Title": "Share the public page",
  "home.howStep3Body":
    "Fans follow standings and matches; you manage from the organizer panel.",
  "home.howCta": "See details",
  "home.ctaSectionHeading": "Ready to organize?",
  "home.ctaSectionLead":
    "Log in or register as an organizer to create tournaments, or browse the public demo data.",
  "home.ctaSectionOrganize": "Go to organize",
  "home.ctaSectionAbout": "More about ScoreLive",

  "card.teamsPlayed": "{teams} teams · {played}/{total} matches played",
  "card.playersPlayed": "{teams} players · {played}/{total} matches played",
  "card.follow": "Follow tournament",
  "card.manage": "Manage",
  "card.favoriteAdd": "Add to favorites",
  "card.favoriteRemove": "Remove from favorites",

  "participant.team": "Teams",
  "participant.individual": "Individual",

  "format.groups": "Groups",
  "format.knockout": "Knockout",
  "format.groups_knockout": "Groups → knockout",
  "format.league": "League",
  "format.swiss": "Swiss system",

  "theme.label": "Theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.toggleToLight": "Switch to light theme",
  "theme.toggleToDark": "Switch to dark theme",

  "organize.title": "Organize a tournament",
  "organize.lead":
    "Universal format — groups, knockout, both, league, or Swiss system. Sport is free text.",
  "organize.name": "Tournament name",
  "organize.sport": "Sport / discipline",
  "organize.sportPlaceholder": "e.g. Volleyball, Chess, Football",
  "organize.startDate": "Start date",
  "organize.endDate": "End date",
  "organize.participantType": "Participants",
  "organize.participantTypeTeam": "Teams",
  "organize.participantTypeIndividual": "Individual",
  "organize.format": "Format",
  "organize.formatPlaceholder": "Choose a format",
  "organize.groupCount": "Number of groups",
  "organize.submit": "Create and add teams",
  "organize.submitIndividual": "Create and add players",
  "organize.errorRequired": "Fill in name, sport, and dates.",
  "organize.errorDates": "End date must be on or after the start date.",
  "organize.existingHeading": "Your tournaments",
  "organize.loading": "Loading…",
  "organize.empty": "No tournaments yet.",

  "manage.loading": "Loading…",
  "manage.notFoundTitle": "Tournament not found",
  "manage.notFoundBody": "Check the address or create a new tournament.",
  "manage.forbiddenTitle": "Not your tournament",
  "manage.forbiddenBody":
    "This tournament belongs to another organizer. Only the owner can edit it.",
  "manage.backOrganize": "Back to organize",
  "manage.publicLink": "Public follow page",
  "manage.tabsLabel": "Management sections",
  "manage.tabTeams": "Teams",
  "manage.tabPlayers": "Players",
  "manage.tabFixtures": "Fixtures",
  "manage.tabScores": "Scores",
  "manage.teamName": "New team",
  "manage.playerName": "Player name",
  "manage.country": "Country",
  "manage.countryOptional": "Country (optional)",
  "manage.logo": "Logo (optional)",
  "manage.logoHelp": "PNG, JPEG, or WebP up to 2 MB. Compressed locally (no SVG).",
  "manage.logoClear": "Remove logo",
  "manage.addTeam": "Add",
  "manage.removeTeam": "Remove",
  "manage.noTeams": "No teams yet.",
  "manage.noPlayers": "No players yet.",
  "manage.generate": "Generate fixtures",
  "manage.errorTeamName": "Enter a team name.",
  "manage.errorPlayerName": "Enter a player name.",
  "manage.errorCountry": "Choose a country.",
  "manage.errorMinTeams": "Add at least two teams before generating.",
  "manage.errorMinPlayers": "Add at least two players before generating.",
  "manage.errorLogoType": "Logo must be PNG, JPEG, or WebP.",
  "manage.errorLogoSize": "File is too large (max 2 MB).",
  "manage.errorLogoRead": "Could not read the image.",
  "manage.fixturesEmpty":
    "No fixtures yet. Add teams and generate matches.",
  "manage.fixturesEmptyPlayers":
    "No fixtures yet. Add players and generate matches.",
  "manage.scoresNeedFixtures": "Generate fixtures first.",
  "manage.scoresAllDone":
    "All available matches have scores. You can still edit below.",
  "manage.fixturesGenerated": "Fixtures have been generated.",
  "manage.nextSwissRound": "Generate next round",
  "manage.nextSwissRoundDone": "Next Swiss round generated.",
  "manage.nextSwissRoundBlocked":
    "Finish the current round or you have reached the maximum rounds.",
  "manage.scoreUpdated":
    "Score updated: {home} {homeScore} : {awayScore} {away}",
  "manage.errorSync":
    "Saved only on this device — server sync failed. Check your connection and try again.",

  "public.loading": "Loading tournament…",
  "public.notFoundTitle": "Tournament not found",
  "public.notFoundBody":
    "Demo data may have been cleared. Return to the home page.",
  "public.backHome": "Back to home",
  "public.meta": "{format} · {start} — {end} · {count} participants",
  "public.editAsOrganizer": "Edit as organizer",
  "public.viewsLabel": "Tournament views",
  "public.tabStandings": "Standings",
  "public.tabBracket": "Bracket",
  "public.tabMatches": "Matches",
  "public.standingsHeading": "Standings",
  "public.matchesHeading": "Matches",
  "public.shareHeading": "Share",
  "public.live": "Live",
  "public.liveHint": "Scores refresh automatically while this tab is open.",
  "public.liveUpdated": "Scores and standings updated.",

  "share.label": "Share this tournament",
  "share.native": "Share",
  "share.copy": "Copy link",
  "share.copied": "Link copied",
  "share.facebook": "Facebook",
  "share.x": "X",

  "favorites.title": "Favorite tournaments",
  "favorites.lead":
    "Saved tournaments stay in this browser. When you are logged in, they sync to your account in the database.",
  "favorites.loading": "Loading…",
  "favorites.emptyTitle": "No favorites yet",
  "favorites.emptyBody":
    "Add a tournament with the heart icon on cards or the public page.",
  "favorites.browse": "Browse tournaments",

  "login.title": "Organizer log in",
  "login.lead":
    "Organizer log in unlocks tournament creation and score entry.",
  "login.username": "Username",
  "login.password": "Password",
  "login.forgot": "Forgot password?",
  "login.submit": "Log in",
  "login.error": "Invalid username or password.",
  "login.loading": "Checking…",
  "login.success": "Logged in successfully.",
  "login.noAccount": "No account yet?",

  "register.title": "Organizer registration",
  "register.lead":
    "Create an account to organize tournaments and enter scores.",
  "register.username": "Username",
  "register.usernameHelp": "3–32 characters: letters, numbers, or _",
  "register.email": "Email (optional)",
  "register.emailHelp":
    "Used only for password-reset messages when email delivery is configured.",
  "register.password": "Password",
  "register.passwordHelp": "At least 8 characters.",
  "register.confirmPassword": "Confirm password",
  "register.submit": "Register",
  "register.loading": "Creating…",
  "register.haveAccount": "Already have an account?",
  "register.error": "Registration failed. Please try again.",
  "register.errorUsername": "Invalid username.",
  "register.errorPassword": "Password must be at least 8 characters.",
  "register.errorMismatch": "Passwords do not match.",
  "register.errorTaken": "That username is already taken.",
  "register.errorEmail": "Enter a valid email address.",
  "register.errorEmailTaken": "That email is already registered.",

  "forgot.title": "Forgot password",
  "forgot.lead":
    "Enter your username or the email on your account. If we find a match, we send a reset link when email delivery is configured — otherwise the link is logged for the operator.",
  "forgot.identifier": "Username or email",
  "forgot.identifierHelp":
    "We always show the same confirmation — we do not reveal whether an account exists.",
  "forgot.submit": "Send reset link",
  "forgot.loading": "Sending…",
  "forgot.success":
    "If an account matches, a password reset link was prepared. Check your email when delivery is configured, or ask the operator if you use a local setup.",
  "forgot.error": "Something went wrong. Please try again shortly.",
  "forgot.backLogin": "Back to log in",

  "reset.title": "Choose a new password",
  "reset.lead": "Set a new password for your organizer account.",
  "reset.password": "New password",
  "reset.passwordHelp": "At least 8 characters.",
  "reset.confirmPassword": "Confirm new password",
  "reset.submit": "Update password",
  "reset.loading": "Updating…",
  "reset.success": "Password updated. You can log in with the new password.",
  "reset.error": "Could not reset the password. Please try again.",
  "reset.errorToken":
    "This reset link is invalid or has expired. Request a new one.",
  "reset.errorPassword": "Password must be at least 8 characters.",
  "reset.errorMismatch": "Passwords do not match.",

  "auth.requiredTitle": "Log in required",
  "auth.requiredBody":
    "Only organizers can organize tournaments and enter scores.",
  "auth.goLogin": "Go to log in",

  "about.title": "About ScoreLive",
  "about.lead":
    "ScoreLive is an open tournament platform — built for clubs, schools, and communities that want clear standings without heavy accounts.",
  "about.body1":
    "Organizers pick a format, add teams, and update scores. Players and fans follow public pages live.",
  "about.body2":
    "The project is MIT licensed, bilingual (BG/EN), and designed toward WCAG 2.2 Level AAA on core screens.",
  "about.ctaOrganize": "Start a tournament",
  "about.ctaA11y": "Accessibility",

  "how.title": "How it works",
  "how.lead":
    "From create to share — a short flow with a shared database for registered organizers.",
  "how.step1Title": "1. Create a tournament",
  "how.step1Body":
    "Log in or register, choose a sport and format: groups, knockout, both, league, or Swiss.",
  "how.step2Title": "2. Add participants",
  "how.step2Body":
    "Enter teams with nationality and optional logos, then generate fixtures.",
  "how.step3Title": "3. Enter scores",
  "how.step3Body":
    "Standings and brackets update immediately. In groups → knockout, winners advance automatically.",
  "how.step4Title": "4. Share and save",
  "how.step4Body":
    "Send the public link, share on social, or heart the tournament as a favorite.",
  "how.cta": "Organize now",

  "faq.title": "Frequently asked questions",
  "faq.lead":
    "Short answers about ScoreLive — an open platform with shared server-backed tournaments.",
  "faq.q1": "Do I need an account to follow a tournament?",
  "faq.a1":
    "No. Public live pages and discovery are open to everyone. An account is only required to organize tournaments and enter scores.",
  "faq.q2": "Where is data stored?",
  "faq.a2":
    "Organizer tournaments are stored in Turso (libSQL). Demo seeds may stay local in the browser. Favorites sync to the database when you are logged in.",
  "faq.q3": "How does live follow work?",
  "faq.a3":
    "Open the public tournament link. While the tab is visible, scores and standings refresh automatically every few seconds — no reload needed.",
  "faq.q4": "What are League and Swiss formats?",
  "faq.a4":
    "League: round-robin, everyone plays everyone, points 3/1/0. Swiss: several rounds paired by points, no rematches, Buchholz tie-break.",
  "faq.q5": "Are there payments or OAuth?",
  "faq.a5":
    "Not in this version. No payments or external identity providers. Password reset is available via a secure link (email when Resend is configured).",
  "faq.q6": "How do I change language or theme?",
  "faq.a6":
    "Use the BG/EN and light/dark toggles in the header. The page lang attribute follows the selected language.",
  "faq.q7": "Does ScoreLive support team and individual competitions?",
  "faq.a7":
    "Yes. When creating a tournament you choose team or individual participants. Formats (groups, knockout, both, league, Swiss) work in either mode.",

  "standings.empty": "No standings yet.",
  "standings.colRank": "#",
  "standings.colTeam": "Team",
  "standings.colPlayer": "Player",
  "standings.colPlayed": "P",
  "standings.colWon": "W",
  "standings.colDrawn": "D",
  "standings.colLost": "L",
  "standings.colDiff": "GD",
  "standings.colPoints": "Pts",
  "standings.colBuchholz": "Bh",
  "standings.legend":
    "P = played, W = won, D = drawn, L = lost, GD = goal difference, Pts = points",
  "standings.legendSwiss":
    "P = played, W = won, D = drawn, L = lost, GD = score diff, Pts = points (1/½/0), Bh = Buchholz",

  "matches.empty": "No matches.",
  "matches.listLabel": "Match list",
  "matches.statusPlayed": "Played",
  "matches.statusPending": "Waiting",
  "matches.statusUpcoming": "Upcoming",
  "matches.statusBye": "Bye",
  "matches.waiting": "Waiting",
  "matches.bye": "Bye",
  "matches.vs": "vs",

  "bracket.heading": "Knockout",
  "bracket.empty": "The bracket appears when a knockout stage exists.",
  "bracket.listLabel": "Knockout bracket",
  "bracket.roundFallback": "Round {round}",

  "score.home": "Home ({team})",
  "score.away": "Away ({team})",
  "score.save": "Save score",
  "score.errorNoTeams": "This match does not have both teams yet.",
  "score.errorNoPlayers": "This match does not have both players yet.",
  "score.errorNumbers": "Enter whole non-negative numbers for the score.",
  "score.errorDraw": "Knockout matches need a winner (no draws).",

  "group.name": "Group {letter}",
  "match.groupRound": "{group} · Round {round}",
  "match.roundOnly": "Round {round}",
  "match.swissRound": "Swiss · Round {round}",
  "match.swissBye": "Swiss · Round {round} · Bye",
  "knockout.final": "Final",
  "knockout.semi": "Semi-final",
  "knockout.quarter": "Quarter-final",
  "knockout.eighth": "Round of 16",
  "knockout.roundOf": "Round of {count}",

  "team.flagAlt": "Flag of {country}",
  "team.logoAlt": "Logo of {name}",
  "team.initialsFallback": "Initials for {name}",

  "a11y.title": "Accessibility",
  "a11y.intro":
    "ScoreLive targets WCAG 2.2 Level AAA on the core screens. The full statement lives in the repository as ACCESSIBILITY.md.",
  "a11y.item.skip": "Skip link to main content",
  "a11y.item.landmarks": "Semantic landmarks and visible focus styles",
  "a11y.item.contrast": "Text contrast ≥ 7:1 against background tokens",
  "a11y.item.live": "Live announcements when scores update (aria-live)",
  "a11y.item.motion": "Respect for prefers-reduced-motion",
  "a11y.item.locale": "Language toggle with matching lang attribute",
  "a11y.item.identity":
    "Flags and logos with text labels (not color alone)",

  "privacy.title": "Privacy policy",
  "privacy.lead":
    "How ScoreLive handles organizer accounts, tournaments, sessions, and password recovery.",
  "privacy.s1Title": "What we collect",
  "privacy.s1Body":
    "On registration: username, a password hash, and an optional email for account recovery. When you organize: tournaments (team or individual), entrants, matches, and scores tied to your account. Favorites are stored for signed-in users. ScoreLive does not process payments and does not use external identity providers (OAuth).",
  "privacy.s2Title": "Where data is hosted",
  "privacy.s2Body":
    "The app runs on Vercel. Durable data lives in Turso (libSQL): users, revocable sessions, tournaments, favorites, auth rate-limit counters, and password-reset tokens. Demo tournaments may remain in the browser (localStorage).",
  "privacy.s3Title": "Cookies and sessions",
  "privacy.s3Body":
    "We use HttpOnly session cookies (HMAC plus a session id) to keep you signed in. Sessions are stored in Turso and are revoked on logout or after a successful password reset. A favorites cookie helps sync guest favorites. ScoreLive does not set advertising or third-party tracking cookies.",
  "privacy.s4Title": "Password reset",
  "privacy.s4Body":
    "If you request a password reset and your account has an email on file, ScoreLive can send a one-time reset link by email when email delivery is configured. Until then, reset links are available only to the site operator via server logs. Reset tokens are stored hashed, expire after one hour, and are single-use. Username-only accounts cannot receive email recovery.",
  "privacy.s5Title": "Contact",
  "privacy.s5Body":
    "For privacy questions or data requests, open a GitHub issue: https://github.com/esmobg/scorelive/issues",

  "terms.title": "Terms of use",
  "terms.lead":
    "Rules for using ScoreLive as an open tournament platform.",
  "terms.s1Title": "The service",
  "terms.s1Body":
    "ScoreLive lets you register an organizer account, create and share team or individual tournaments, enter scores, follow live standings, and reset a forgotten password with a secure link. The product is open source (MIT). There are no payments, subscriptions, or OAuth logins in this version.",
  "terms.s2Title": "Your responsibilities",
  "terms.s2Body":
    "You are responsible for your password and for the content of tournaments you publish. Keep a recovery email on your account if you want password-reset messages by email. Do not abuse the API (for example automated login or reset attempts). Auth requests are rate-limited per IP in Turso.",
  "terms.s3Title": "Availability and data",
  "terms.s3Body":
    "The service is provided as-is. Outages or data loss can occur even with host-side backups. Keep critical results elsewhere if they matter.",
  "terms.s4Title": "Contact",
  "terms.s4Body":
    "Feedback and bug reports: https://github.com/esmobg/scorelive/issues",
} as const satisfies Messages;
