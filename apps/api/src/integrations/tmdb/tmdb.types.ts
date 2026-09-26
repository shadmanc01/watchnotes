export type TmdbMediaType = "movie" | "tv";

export type TmdbSearchResult = {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
};

export type TmdbSearchResponse = {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
};

export type TmdbMovieDetails = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
  runtime?: number | null;
};

export type TmdbTvDetails = {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
  episode_run_time?: number[];
  number_of_episodes?: number;
};
