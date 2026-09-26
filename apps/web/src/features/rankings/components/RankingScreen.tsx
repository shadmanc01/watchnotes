"use client";

import type {
  MediaType,
  RankingEntry,
  RankingSessionActive,
  RankingSessionResult,
  WatchedItem,
} from "@watchnotes/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import {
  answerRanking,
  getActiveRankingSession,
  getRanking,
  getUnrankedWatched,
  startRanking,
} from "../api/ranking.api";
import { ComparisonArena } from "./ComparisonArena";
import { RankingList } from "./RankingList";
import { RankQueue } from "./RankQueue";

function getCategoryLabel(type: MediaType) {
  return type === "movie" ? "Movies" : "TV Shows";
}

export function RankingScreen() {
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [unranked, setUnranked] = useState<WatchedItem[]>([]);
  const [session, setSession] = useState<RankingSessionActive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadRanking = useCallback(async (type: MediaType) => {
    setIsLoading(true);
    setError(null);

    try {
      const [rankingResponse, unrankedResponse, sessionResponse] =
        await Promise.all([
          getRanking(type),
          getUnrankedWatched(type),
          getActiveRankingSession(type),
        ]);

      setEntries(rankingResponse.entries);
      setUnranked(unrankedResponse.items);
      setSession(sessionResponse.session);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your ranking.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRanking(mediaType);
  }, [loadRanking, mediaType]);

  async function handleResult(result: RankingSessionResult) {
    if (result.status === "active") {
      setSession(result);
      return;
    }

    setSession(null);
    setMessage(
      `${result.candidate.title} is now #${result.position} in your ${getCategoryLabel(result.mediaType).toLowerCase()} ranking.`,
    );
    await loadRanking(result.mediaType);
  }

  async function handleStart(mediaId: string) {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await startRanking(mediaType, mediaId);
      await handleResult(response.session);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Unable to start ranking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChoose(preferredMediaId: string) {
    if (!session) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await answerRanking(
        mediaType,
        session.sessionId,
        preferredMediaId,
      );
      await handleResult(response.session);
    } catch (answerError) {
      setError(
        answerError instanceof Error
          ? answerError.message
          : "Unable to save that comparison.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <section>
        <p className="page-kicker">Rank</p>
        <h1 className="page-title">Your taste, ordered.</h1>
        <p className="page-lede">
          Watchnotes uses head-to-head choices instead of star ratings. Each
          answer narrows down exactly where a title belongs.
        </p>

        <div className="inline-links">
          <Link href="/watched">Watched</Link>
          <Link href="/discover">Discover</Link>
        </div>

        <div className="ranking-toolbar">
          {(["movie", "tv"] as const).map((type) => (
            <button
              key={type}
              type="button"
              disabled={Boolean(session) || isSubmitting}
              onClick={() => {
                setMediaType(type);
                setMessage(null);
              }}
              aria-pressed={mediaType === type}
            >
              {getCategoryLabel(type)}
            </button>
          ))}
        </div>

        {error ? (
          <p className="status-message" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="status-message" role="status">
            {message}
          </p>
        ) : null}

        {session ? (
          <ComparisonArena
            session={session}
            isSubmitting={isSubmitting}
            onChoose={(mediaId) => void handleChoose(mediaId)}
          />
        ) : null}

        {isLoading ? (
          <p>Loading ranking...</p>
        ) : (
          <div className="ranking-layout">
            <section className="ranking-panel">
              <h2>{getCategoryLabel(mediaType)} ranking</h2>
              <RankingList entries={entries} />
            </section>

            <aside className="ranking-panel">
              <h2>Ready to rank</h2>
              <RankQueue
                items={unranked}
                disabled={Boolean(session) || isSubmitting}
                onStart={(mediaId) => void handleStart(mediaId)}
              />
            </aside>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
