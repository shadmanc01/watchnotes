import type { MediaSummary, MediaType } from "@watchnotes/shared";
import type { TmdbSearchResult } from "./tmdb.types.js";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function getReleaseYear(value?: string) {
  if (!value) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

export function mapTmdbSearchResult(result: TmdbSearchResult): MediaSummary | null {
  if (result.media_type !== "movie" && result.media_type !== "tv") {
    return null;
  }

  const type: MediaType = result.media_type;
  const title = type === "movie" ? result.title : result.name;

  if (!title) {
    return null;
  }

  const releaseDate =
    type === "movie" ? result.release_date : result.first_air_date;

  return {
    id: `tmdb:${type}:${result.id}`,
    providerId: result.id,
    type,
    title,
    releaseYear: getReleaseYear(releaseDate),
    posterUrl: result.poster_path
      ? `${TMDB_IMAGE_BASE_URL}${result.poster_path}`
      : null,
    overview: result.overview?.trim() || null,
    runtimeMinutes: null,
  };
}
