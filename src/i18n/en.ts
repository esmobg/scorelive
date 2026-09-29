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
  "home.tournamentsLead": "Demo data loads locally in your browser.",
  "home.resetDemo": "Restore demo",
  "home.loading": "Loading tournaments…",
  "home.emptyTitle": "No tournaments",
  "home.emptyBody": "Create your first tournament or restore the demo data.",
  "home.howHeading": "How it works",
  "home.howLead":
    "Three steps from idea to live standings — no paid plans.",
  "home.howStep1Title": "Pick a format",
  "home.howStep1Body":
    "Choose groups, knockout, both, or a full league championship.",
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
  "card.follow": "Follow tournament",
  "card.manage": "Manage",
  "card.favoriteAdd": "Add to favorites",
  "card.favoriteRemove": "Remove from favorites",

  "format.groups": "Groups",
  "format.knockout": "Knockout",
  "format.groups_knockout": "Groups → knockout",
  "format.league": "League",

  "organize.title": "Organize a tournament",
  "organize.lead":
    "Universal format — groups, knockout, both, or a league table. Sport is free text.",
  "organize.name": "Tournament name",
  "organize.sport": "Sport / discipline",
  "organize.sportPlaceholder": "e.g. Volleyball, Chess, Football",
  "organize.startDate": "Start date",
  "organize.endDate": "End date",
  "organize.format": "Format",
  "organize.formatPlaceholder": "Choose a format",
  "organize.groupCount": "Number of groups",
  "organize.submit": "Create and add teams",
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
    "This tournament is owned by another organizer in this browser. Soft client-side check only — data still lives in localStorage.",
  "manage.backOrganize": "Back to organize",
  "manage.publicLink": "Public follow page",
  "manage.tabsLabel": "Management sections",
  "manage.tabTeams": "Teams",
  "manage.tabFixtures": "Fixtures",
  "manage.tabScores": "Scores",
  "manage.teamName": "New team / participant",
  "manage.country": "Country",
  "manage.logo": "Logo (optional)",
  "manage.logoHelp": "PNG, JPEG, or WebP up to 2 MB. Compressed locally (no SVG).",
  "manage.logoClear": "Remove logo",
  "manage.addTeam": "Add",
  "manage.removeTeam": "Remove",
  "manage.noTeams": "No teams yet.",
  "manage.generate": "Generate fixtures",
  "manage.errorTeamName": "Enter a team name.",
  "manage.errorCountry": "Choose a country.",
  "manage.errorMinTeams": "Add at least two teams before generating.",
  "manage.errorLogoType": "Logo must be PNG, JPEG, or WebP.",
  "manage.errorLogoSize": "File is too large (max 2 MB).",
  "manage.errorLogoRead": "Could not read the image.",
  "manage.fixturesEmpty":
    "No fixtures yet. Add teams and generate matches.",
  "manage.scoresNeedFixtures": "Generate fixtures first.",
  "manage.scoresAllDone":
    "All available matches have scores. You can still edit below.",
  "manage.fixturesGenerated": "Fixtures have been generated.",
  "manage.scoreUpdated":
    "Score updated: {home} {homeScore} : {awayScore} {away}",

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

  "share.label": "Share this tournament",
  "share.native": "Share",
  "share.copy": "Copy link",
  "share.copied": "Link copied",
  "share.facebook": "Facebook",
  "share.x": "X",

  "favorites.title": "Favorite tournaments",
  "favorites.lead":
    "Saved tournaments stay in this browser. When you are logged in as admin, they also sync with your session.",
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
    "From create to share — a short flow with no cloud database in this version.",
  "how.step1Title": "1. Create a tournament",
  "how.step1Body":
    "Log in as admin, choose a sport and format: groups, knockout, both, or league.",
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
  "faq.lead": "Short answers about the demo and current capabilities.",
  "faq.q1": "Do I need an account to follow a tournament?",
  "faq.a1":
    "No. Public pages, discovery, and favorites are open. An admin account is only required to organize and enter scores.",
  "faq.q2": "Where is data stored?",
  "faq.a2":
    "Tournaments live in browser localStorage. Favorites do too; when an admin is logged in they also sync into the session cookie.",
  "faq.q3": "What is the League format?",
  "faq.a3":
    "A single round-robin (each team plays every other once). Points are 3/1/0; standings sort by points → goal difference → goals for.",
  "faq.q4": "Are there payments or OAuth?",
  "faq.a4":
    "Not in this version. No payments, email password reset, or external identity providers.",
  "faq.q5": "How do I change language?",
  "faq.a5":
    "Use the BG/EN toggle in the header. The page lang attribute updates automatically.",

  "standings.empty": "No standings yet.",
  "standings.colRank": "#",
  "standings.colTeam": "Team",
  "standings.colPlayed": "P",
  "standings.colWon": "W",
  "standings.colDrawn": "D",
  "standings.colLost": "L",
  "standings.colDiff": "GD",
  "standings.colPoints": "Pts",
  "standings.legend":
    "P = played, W = won, D = drawn, L = lost, GD = goal difference, Pts = points",

  "matches.empty": "No matches.",
  "matches.listLabel": "Match list",
  "matches.statusPlayed": "Played",
  "matches.statusPending": "Waiting",
  "matches.statusUpcoming": "Upcoming",
  "matches.waiting": "Waiting",
  "matches.vs": "vs",

  "bracket.heading": "Knockout",
  "bracket.empty": "The bracket appears when a knockout stage exists.",
  "bracket.listLabel": "Knockout bracket",
  "bracket.roundFallback": "Round {round}",

  "score.home": "Home ({team})",
  "score.away": "Away ({team})",
  "score.save": "Save score",
  "score.errorNoTeams": "This match does not have both teams yet.",
  "score.errorNumbers": "Enter whole non-negative numbers for the score.",
  "score.errorDraw": "Knockout matches need a winner (no draws).",

  "group.name": "Group {letter}",
  "match.groupRound": "{group} · Round {round}",
  "match.roundOnly": "Round {round}",
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
} as const satisfies Messages;
