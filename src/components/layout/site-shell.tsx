import Link from "next/link";

const navItems = [
  { href: "/", label: "Начало" },
  { href: "/organize", label: "Организирай" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--tf-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          Turnyfly
        </Link>
        <nav aria-label="Основна навигация">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[var(--tf-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--tf-line)] bg-[var(--tf-foam)]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-[var(--tf-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Turnyfly — отворена платформа за турнири. MIT лиценз.
        </p>
        <p>
          <a
            href="/accessibility"
            className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
          >
            Достъпност
          </a>
        </p>
      </div>
    </footer>
  );
}
