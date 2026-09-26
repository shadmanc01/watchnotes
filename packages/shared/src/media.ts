export type MediaType = "movie" | "tv";

export type MediaSummary = {
  id: string;
  providerId: number;
  type: MediaType;
  title: string;
  releaseYear: number | null;
  posterUrl: string | null;
  overview: string | null;
  runtimeMinutes: number | null;
};
