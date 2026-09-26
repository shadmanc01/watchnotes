import type {
  MediaType,
  RankingEntry,
  SocialProfile,
  SocialViewerState,
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
        : "Unable to load this profile.";

    throw new Error(message);
  }

  return payload as T;
}

export function getSocialProfile(username: string) {
  return request<{ socialProfile: SocialProfile }>(
    `/social/profiles/${encodeURIComponent(username)}`,
  );
}

export function getSocialViewer(username: string) {
  return request<{ viewer: SocialViewerState }>(
    `/social/profiles/${encodeURIComponent(username)}/viewer`,
  );
}

export function getPublicRanking(username: string, type: MediaType) {
  return request<{ entries: RankingEntry[] }>(
    `/social/profiles/${encodeURIComponent(username)}/rankings/${type}`,
  );
}

export function followUser(username: string) {
  return request<{ success: boolean }>(
    `/social/profiles/${encodeURIComponent(username)}/follow`,
    {
      method: "POST",
    },
  );
}

export function unfollowUser(username: string) {
  return request<{ success: boolean }>(
    `/social/profiles/${encodeURIComponent(username)}/follow`,
    {
      method: "DELETE",
    },
  );
}

export function saveFromUserRanking(
  username: string,
  type: MediaType,
  mediaId: string,
) {
  return request<{ success: boolean }>(
    `/social/profiles/${encodeURIComponent(username)}/rankings/${type}/${encodeURIComponent(mediaId)}/save`,
    {
      method: "POST",
    },
  );
}
