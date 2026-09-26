import type { MediaSummary, MediaType } from "@watchnotes/shared";
import {
  mapTmdbMovieDetails,
  mapTmdbSearchResult,
  mapTmdbTvDetails,
} from "./tmdb.mapper.js";
import type {
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbTvDetails,
} from "./tmdb.types.js";

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

async function tmdbFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${TMDB_API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getReadAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
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

export async function getTmdbMediaDetails(
  type: MediaType,
  providerId: number,
): Promise<MediaSummary> {
  if (type === "movie") {
    const movie = await tmdbFetch<TmdbMovieDetails>(
      `/movie/${providerId}?language=en-US`,
    );
    return mapTmdbMovieDetails(movie);
  }

  const show = await tmdbFetch<TmdbTvDetails>(
    `/tv/${providerId}?language=en-US`,
  );
  return mapTmdbTvDetails(show);
}
