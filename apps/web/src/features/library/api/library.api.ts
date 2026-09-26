import type {
  LibraryMediaReference,
  WatchedItem,
  WatchlistItem,
} from "@watchnotes/shared";

type ApiError = {
  error?: string;
};

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return new URL(path, baseUrl);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiError
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload && payload.error
        ? payload.error
        : "Unable to update your library.";

    throw new Error(message);
  }

  return payload as T;
}

export function addToWatchlist(media: LibraryMediaReference) {
  return request("/library/watchlist", {
    method: "POST",
    body: JSON.stringify(media),
  });
}

export function markWatched(media: LibraryMediaReference) {
  return request<{ isRewatch: boolean }>("/library/watched", {
    method: "POST",
    body: JSON.stringify(media),
  });
}

export function getWatchlist() {
  return request<{ items: WatchlistItem[] }>("/library/watchlist");
}

export function getWatched() {
  return request<{ items: WatchedItem[] }>("/library/watched");
}
