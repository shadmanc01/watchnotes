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
