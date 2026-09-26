import type {
  MediaType,
  RankingEntry,
  RankingSessionActive,
  RankingSessionResult,
  WatchedItem,
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
        : "Unable to update your ranking.";

    throw new Error(message);
  }

  return payload as T;
}

export function getRanking(type: MediaType) {
  return request<{ entries: RankingEntry[] }>(`/rankings/${type}`);
}

export function getUnrankedWatched(type: MediaType) {
  return request<{ items: WatchedItem[] }>(`/rankings/${type}/unranked`);
}

export function getActiveRankingSession(type: MediaType) {
  return request<{ session: RankingSessionActive | null }>(
    `/rankings/${type}/session`,
  );
}

export function startRanking(type: MediaType, mediaId: string) {
  return request<{ session: RankingSessionResult }>(
    `/rankings/${type}/start`,
    {
      method: "POST",
      body: JSON.stringify({ mediaId }),
    },
  );
}

export function answerRanking(
  type: MediaType,
  sessionId: string,
  preferredMediaId: string,
) {
  return request<{ session: RankingSessionResult }>(
    `/rankings/${type}/sessions/${sessionId}/answer`,
    {
      method: "POST",
      body: JSON.stringify({ preferredMediaId }),
    },
  );
}
