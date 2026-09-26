"use client";

import type { MediaSummary } from "@watchnotes/shared";
import Link from "next/link";
import { useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import { searchMedia } from "../api/searchMedia";
import { MediaSearchForm } from "./MediaSearchForm";
import { MediaSearchResults } from "./MediaSearchResults";

export function DiscoverScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchMedia(normalizedQuery);
      setResults(response.results);
      setHasSearched(true);
    } catch (searchError) {
      setResults([]);
      setHasSearched(true);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Unable to search right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageContainer>
      <section className="content-narrow">
        <p className="page-kicker">Discover</p>
        <h1 className="page-title">Find something you watched.</h1>
        <p className="page-lede">
          Search movies and TV shows, then mark them watched or save them for
          later.
        </p>

        <div className="inline-links">
          <Link href="/watched">Watched</Link>
          <Link href="/watchlist">Watchlist</Link>
        </div>

        <MediaSearchForm
          value={query}
          isLoading={isLoading}
          onChange={setQuery}
          onSubmit={handleSearch}
        />

        {error ? (
          <p className="status-message" role="alert">
            {error}
          </p>
        ) : null}

        <MediaSearchResults results={results} hasSearched={hasSearched} />
      </section>
    </PageContainer>
  );
}
