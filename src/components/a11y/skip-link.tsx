import Link from "next/link";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link focus:bg-[var(--tf-ink)] focus:text-[var(--tf-foam)]"
    >
      Към основното съдържание
    </a>
  );
}
