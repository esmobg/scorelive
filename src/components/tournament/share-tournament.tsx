"use client";

import { useEffect, useState } from "react";
import { facebookShareUrl, xShareUrl } from "@/lib/social";
import { useLocale } from "@/i18n/locale-provider";
import { Button } from "@/components/ui/button";

interface ShareTournamentProps {
  title: string;
  path: string;
}

export function ShareTournament({ title, path }: ShareTournamentProps) {
  const { t } = useLocale();
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    const absolute =
      typeof window !== "undefined"
        ? new URL(path, window.location.origin).toString()
        : path;
    setUrl(absolute);
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, [path]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) {
      return;
    }
    try {
      await navigator.share({ title, url, text: title });
    } catch {
      // User cancelled or share failed — no error UI needed.
    }
  }

  return (
    <div className="space-y-3" role="group" aria-label={t("share.label")}>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--tf-ink)]">
        {t("public.shareHeading")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {canNativeShare ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => void handleNativeShare()}
          >
            {t("share.native")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => void handleCopy()}
        >
          {copied ? t("share.copied") : t("share.copy")}
        </Button>
        <a
          href={facebookShareUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("share.facebook")}
        </a>
        <a
          href={xShareUrl(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tf-accent)]"
        >
          {t("share.x")}
        </a>
      </div>
      {copied ? (
        <p role="status" className="sr-only">
          {t("share.copied")}
        </p>
      ) : null}
    </div>
  );
}
