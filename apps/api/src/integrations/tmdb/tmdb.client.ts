import type { MediaSummary } from "@watchnotes/shared";
import { mapTmdbSearchResult } from "./tmdb.mapper.js";
import type { TmdbSearchResponse } from "./tmdb.types.js";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";

function getReadAccessToken() {
  const token = process.env.TMDB_API_READ_TOKEN;

  if (!token) {
    throw new Error(
      "TMDB_API_READ_TOKEN is missing. Add it to the backend environment before using media search.",
    );
  }

  return token;
}

export async function searchTmdb(query: string): Promise<MediaSummary[]> {
  const url = new URL(`${TMDB_API_BASE_URL}/search/multi`);
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getReadAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB search failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as TmdbSearchResponse;

  return payload.results
    .map(mapTmdbSearchResult)
    .filter((result): result is MediaSummary => result !== null);
}
