"use client";

import { FAQ_ITEM_KEYS } from "@/lib/faq/items";
import { useLocale } from "@/i18n/locale-provider";

export function FaqList({ className = "space-y-4" }: { className?: string }) {
  const { t } = useLocale();

  const items = FAQ_ITEM_KEYS.map(([qKey, aKey]) => ({
    q: t(qKey),
    a: t(aKey),
  }));

  return (
    <div className={className}>
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-xl border border-[var(--tf-line)] bg-[var(--tf-foam)]/80 p-4"
        >
          <summary className="cursor-pointer list-none font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--tf-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)] [&::-webkit-details-marker]:hidden">
            {item.q}
          </summary>
          <p className="mt-3 leading-relaxed text-[var(--tf-ink-muted)]">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
