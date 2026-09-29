import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Достъпност",
};

export default function AccessibilityPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--tf-ink)]">
        Достъпност
      </h1>
      <p className="text-[var(--tf-ink-muted)]">
        Turnyfly е проектиран с цел WCAG 2.2 ниво AAA за основните екрани.
        Пълният документ е в хранилището като{" "}
        <code className="rounded bg-[var(--tf-foam)] px-1.5 py-0.5">
          ACCESSIBILITY.md
        </code>
        .
      </p>
      <ul className="list-disc space-y-2 pl-5 text-[var(--tf-ink)]">
        <li>Връзка за пропускане към основното съдържание</li>
        <li>Семантични ориентири и видими фокус стилове</li>
        <li>Контраст на текста ≥ 7:1 спрямо фоновите токени</li>
        <li>
          Живи съобщения при обновяване на резултати (
          <code>aria-live</code>)
        </li>
        <li>Уважение към prefers-reduced-motion</li>
      </ul>
    </article>
  );
}
