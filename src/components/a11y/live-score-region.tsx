"use client";

import { useEffect, useRef, useState } from "react";

interface LiveScoreRegionProps {
  message: string;
}

/** Polite aria-live region for score update announcements. */
export function LiveScoreRegion({ message }: LiveScoreRegionProps) {
  const [announcement, setAnnouncement] = useState("");
  const last = useRef("");

  useEffect(() => {
    if (!message || message === last.current) {
      return;
    }
    last.current = message;
    setAnnouncement("");
    const id = window.setTimeout(() => setAnnouncement(message), 50);
    return () => window.clearTimeout(id);
  }, [message]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
