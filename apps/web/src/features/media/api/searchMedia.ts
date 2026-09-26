import type { MediaSummary } from "@watchnotes/shared";

type SearchMediaResponse = {
  query: string;
  results: MediaSummary[];
};

export async function searchMedia(query: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const url = new URL("/media/search", apiUrl);
  url.searchParams.set("q", query);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to search movies and TV shows right now.");
  }

  return (await response.json()) as SearchMediaResponse;
}
