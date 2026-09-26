"use client";

import type { LibraryTitleDetail } from "@watchnotes/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { getTitleDetail } from "../api/library.api";
import styles from "./TitleDetail.module.css";
import { TitleNoteEditor } from "./TitleNoteEditor";
import { WatchHistory } from "./WatchHistory";

type TitleDetailScreenProps = {
  mediaId: string;
};

function formatRuntime(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function TitleDetailScreen({ mediaId }: TitleDetailScreenProps) {
  const [detail, setDetail] = useState<LibraryTitleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTitleDetail(mediaId)
      .then((response) => setDetail(response.detail))
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this title.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [mediaId]);

  if (isLoading) {
    return <PageContainer>Loading title...</PageContainer>;
  }

  if (error || !detail) {
    return (
      <PageContainer>
        <section className="content-narrow">
          <p className="page-kicker">Title</p>
          <h1 className="page-title">Unable to load title.</h1>
          <p className="status-message">{error ?? "Title not found."}</p>
          <div className="inline-links">
            <Link href="/watched">Back to watched</Link>
          </div>
        </section>
      </PageContainer>
    );
  }

  const { media } = detail;

  return (
    <PageContainer>
      <section className={styles.hero}>
        <div>
          {media.posterUrl ? (
            <img
              className={styles.poster}
              src={media.posterUrl}
              alt=""
              width={240}
            />
          ) : (
            <div
              className={`${styles.poster} poster-placeholder`}
              aria-hidden="true"
            />
          )}
        </div>

        <div className={styles.heroCopy}>
          <p className="page-kicker">
            {media.type === "movie" ? "Movie" : "TV Show"}
          </p>
          <h1 className={styles.title}>{media.title}</h1>
          <p className={styles.meta}>
            {media.releaseYear ?? "Release year unknown"}
            {media.runtimeMinutes ? ` · ${formatRuntime(media.runtimeMinutes)}` : ""}
          </p>

          {media.overview ? <p className={styles.overview}>{media.overview}</p> : null}

          <div className={styles.badges}>
            {detail.rankingPosition ? (
              <span>#{detail.rankingPosition} in your ranking</span>
            ) : (
              <span>Not ranked yet</span>
            )}
            <span>
              {detail.watchCount === 1
                ? "Watched once"
                : `${detail.watchCount} watches`}
            </span>
            {detail.onWatchlist ? <span>On watchlist</span> : null}
          </div>

          <div className="inline-links">
            <Link href="/rank">Open ranking</Link>
            <Link href="/watched">Watched library</Link>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article>
          <span>Rank</span>
          <strong>
            {detail.rankingPosition ? `#${detail.rankingPosition}` : "—"}
          </strong>
        </article>
        <article>
          <span>Watches</span>
          <strong>{detail.watchCount}</strong>
        </article>
        <article>
          <span>Tracked time</span>
          <strong>
            {detail.trackedRuntimeMinutes > 0
              ? formatRuntime(detail.trackedRuntimeMinutes)
              : "—"}
          </strong>
        </article>
        <article>
          <span>Last watched</span>
          <strong>
            {detail.lastWatchedAt
              ? new Date(detail.lastWatchedAt).toLocaleDateString()
              : "—"}
          </strong>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <TitleNoteEditor
          mediaId={mediaId}
          initialNote={detail.note}
          canEdit={detail.watchCount > 0}
        />
        <WatchHistory events={detail.watchEvents} />
      </section>
    </PageContainer>
  );
}
