"use client";

import type { MediaSummary } from "@watchnotes/shared";
import { useState } from "react";
import { addToWatchlist, markWatched } from "../api/library.api";

type MediaActionsProps = {
  media: MediaSummary;
};

export function MediaActions({ media }: MediaActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runAction(action: "watchlist" | "watched") {
    setIsSaving(true);
    setMessage(null);

    try {
      if (action === "watchlist") {
        await addToWatchlist({
          providerId: media.providerId,
          type: media.type,
        });
        setMessage("Added to watchlist.");
      } else {
        const result = await markWatched({
          providerId: media.providerId,
          type: media.type,
        });
        setMessage(result.isRewatch ? "Rewatch logged." : "Marked as watched.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update your library.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void runAction("watched")}
        >
          Watched
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void runAction("watchlist")}
        >
          + Watchlist
        </button>
      </div>
      {message ? <small role="status">{message}</small> : null}
    </div>
  );
}
