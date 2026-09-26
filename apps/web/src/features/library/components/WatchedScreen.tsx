"use client";

import type { WatchedItem } from "@watchnotes/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { getWatched } from "../api/library.api";
import { LibraryMediaRow } from "./LibraryMediaRow";

function getDetail(item: WatchedItem) {
  const watchLabel =
    item.watchCount === 1 ? "1 watch" : `${item.watchCount} watches`;
  const runtimeLabel =
    item.trackedRuntimeMinutes > 0
      ? ` · ${Math.round(item.trackedRuntimeMinutes / 60)} tracked hours`
      : "";
  const untrackedLabel =
    item.untrackedWatchCount > 0 ? " · TV runtime not tracked yet" : "";

  return `${watchLabel}${runtimeLabel}${untrackedLabel}`;
}

export function WatchedScreen() {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWatched()
      .then((response) => setItems(response.items))
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load watched titles.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageContainer>
      <section style={{ maxWidth: 760 }}>
        <p>Library</p>
        <h1>Watched</h1>
        <p>
          <Link href="/discover">Find a title</Link>
          {" · "}
          <Link href="/watchlist">View watchlist</Link>
        </p>

        {isLoading ? <p>Loading watched titles...</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? (
          <p>You have not marked anything watched yet.</p>
        ) : null}

        {items.map((item) => (
          <LibraryMediaRow
            key={item.media.id}
            media={item.media}
            detail={getDetail(item)}
          />
        ))}
      </section>
    </PageContainer>
  );
}
