"use client";

import type { WatchlistItem } from "@watchnotes/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { getWatchlist } from "../api/library.api";
import { LibraryMediaRow } from "./LibraryMediaRow";

export function WatchlistScreen() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWatchlist()
      .then((response) => setItems(response.items))
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your watchlist.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageContainer>
      <section style={{ maxWidth: 760 }}>
        <p>Library</p>
        <h1>Watchlist</h1>
        <p>
          <Link href="/discover">Find something to add</Link>
          {" · "}
          <Link href="/watched">View watched</Link>
        </p>

        {isLoading ? <p>Loading watchlist...</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!isLoading && !error && items.length === 0 ? (
          <p>Your watchlist is empty.</p>
        ) : null}

        {items.map((item) => (
          <LibraryMediaRow
            key={item.media.id}
            media={item.media}
            detail={`Added ${new Date(item.addedAt).toLocaleDateString()}`}
          />
        ))}
      </section>
    </PageContainer>
  );
}
