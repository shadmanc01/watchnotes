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
      <section className="content-narrow">
        <p className="page-kicker">Library</p>
        <h1 className="page-title">Watchlist</h1>
        <p className="page-lede">Everything you want to watch next, in one place.</p>

        <div className="inline-links">
          <Link href="/discover">Find something to add</Link>
          <Link href="/watched">View watched</Link>
        </div>

        {isLoading ? <p>Loading watchlist...</p> : null}
        {error ? (
          <p className="status-message" role="alert">
            {error}
          </p>
        ) : null}
        {!isLoading && !error && items.length === 0 ? (
          <p>Your watchlist is empty.</p>
        ) : null}

        <div className="library-list">
          {items.map((item) => (
            <LibraryMediaRow
              key={item.media.id}
              media={item.media}
              detail={`Added ${new Date(item.addedAt).toLocaleDateString()}`}
            />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
