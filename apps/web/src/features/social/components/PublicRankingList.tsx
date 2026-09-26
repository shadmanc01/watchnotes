"use client";

import type {
  MediaType,
  RankingEntry,
  SocialViewerState,
} from "@watchnotes/shared";
import { useState } from "react";
import { saveFromUserRanking } from "../api/social.api";
import styles from "./PublicProfile.module.css";

type PublicRankingListProps = {
  username: string;
  mediaType: MediaType;
  entries: RankingEntry[];
  viewer: SocialViewerState;
};

export function PublicRankingList({
  username,
  mediaType,
  entries,
  viewer,
}: PublicRankingListProps) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(mediaId: string) {
    setSavingId(mediaId);
    setMessage(null);

    try {
      await saveFromUserRanking(username, mediaType, mediaId);
      setSavedIds((current) => new Set(current).add(mediaId));
      setMessage(`Saved to your watchlist from @${username}.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save this title.",
      );
    } finally {
      setSavingId(null);
    }
  }

  if (entries.length === 0) {
    return <p>This ranking is empty.</p>;
  }

  return (
    <>
      {!viewer.authenticated && !viewer.isSelf ? (
        <p className={styles.helperText}>
          Sign in to save titles from this ranking to your watchlist.
        </p>
      ) : null}

      {message ? (
        <p className="status-message" role="status">
          {message}
        </p>
      ) : null}

      <ol className={styles.rankingList}>
        {entries.map((entry) => (
          <li className={styles.rankingRow} key={entry.media.id}>
            <strong className={styles.position}>#{entry.position}</strong>

            {entry.media.posterUrl ? (
              <img
                className={styles.poster}
                src={entry.media.posterUrl}
                alt=""
                width={64}
              />
            ) : (
              <div
                className={`${styles.poster} poster-placeholder`}
                aria-hidden="true"
              />
            )}

            <div className={styles.rankingCopy}>
              <strong>{entry.media.title}</strong>
              {entry.media.releaseYear ? (
                <span>{entry.media.releaseYear}</span>
              ) : null}
            </div>

            {viewer.authenticated && !viewer.isSelf ? (
              <button
                type="button"
                disabled={savingId === entry.media.id || savedIds.has(entry.media.id)}
                onClick={() => void handleSave(entry.media.id)}
              >
                {savedIds.has(entry.media.id)
                  ? "Saved"
                  : savingId === entry.media.id
                    ? "Saving..."
                    : "Save"}
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
