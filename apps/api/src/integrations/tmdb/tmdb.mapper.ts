import type { MediaSummary, MediaType } from "@watchnotes/shared";
import type {
  TmdbMovieDetails,
  TmdbSearchResult,
  TmdbTvDetails,
} from "./tmdb.types.js";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function getReleaseYear(value?: string) {
  if (!value) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

function getPosterUrl(path?: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL}${path}` : null;
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
    posterUrl: getPosterUrl(result.poster_path),
    overview: result.overview?.trim() || null,
    runtimeMinutes: null,
  };
}

export function mapTmdbMovieDetails(movie: TmdbMovieDetails): MediaSummary {
  return {
    id: `tmdb:movie:${movie.id}`,
    providerId: movie.id,
    type: "movie",
    title: movie.title,
    releaseYear: getReleaseYear(movie.release_date),
    posterUrl: getPosterUrl(movie.poster_path),
    overview: movie.overview?.trim() || null,
    runtimeMinutes:
      typeof movie.runtime === "number" && movie.runtime > 0
        ? movie.runtime
        : null,
  };
}

export function mapTmdbTvDetails(show: TmdbTvDetails): MediaSummary {
  const typicalEpisodeRuntime = show.episode_run_time?.find(
    (runtime) => runtime > 0,
  );

  return {
    id: `tmdb:tv:${show.id}`,
    providerId: show.id,
    type: "tv",
    title: show.name,
    releaseYear: getReleaseYear(show.first_air_date),
    posterUrl: getPosterUrl(show.poster_path),
    overview: show.overview?.trim() || null,
    runtimeMinutes: typicalEpisodeRuntime ?? null,
  };
}
