import type {
  MediaSummary,
  MediaType,
  RankingEntry,
} from "@watchnotes/shared";
import { createAuthenticatedSupabaseClient } from "../../integrations/supabase/supabase.client.js";

type MediaTitleRow = {
  id: string;
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  release_year: number | null;
  poster_url: string | null;
  overview: string | null;
  runtime_minutes: number | null;
};

type RankingEntryJoinRow = {
  position: number;
  ranked_at: string;
  media_titles: MediaTitleRow | MediaTitleRow[] | null;
};

export type RankingSessionRow = {
  id: string;
  user_id: string;
  candidate_media_id: string;
  media_type: MediaType;
  low_index: number;
  high_index: number;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
};

function getJoinedMedia(
  value: MediaTitleRow | MediaTitleRow[] | null,
): MediaTitleRow | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapMedia(row: MediaTitleRow): MediaSummary {
  return {
    id: row.id,
    providerId: row.tmdb_id,
    type: row.media_type,
    title: row.title,
    releaseYear: row.release_year,
    posterUrl: row.poster_url,
    overview: row.overview,
    runtimeMinutes: row.runtime_minutes,
  };
}

export async function listRankingEntries(
  accessToken: string,
  userId: string,
  mediaType: MediaType,
): Promise<RankingEntry[]> {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("ranking_entries")
    .select(
      "position, ranked_at, media_titles!inner(id, tmdb_id, media_type, title, release_year, poster_url, overview, runtime_minutes)",
    )
    .eq("user_id", userId)
    .eq("media_type", mediaType)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as RankingEntryJoinRow[])
    .map((row) => {
      const media = getJoinedMedia(row.media_titles);

      if (!media) {
        return null;
      }

      return {
        position: row.position,
        rankedAt: row.ranked_at,
        media: mapMedia(media),
      };
    })
    .filter((entry): entry is RankingEntry => entry !== null);
}

export async function getMediaTitle(
  accessToken: string,
  mediaId: string,
): Promise<MediaSummary | null> {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("media_titles")
    .select(
      "id, tmdb_id, media_type, title, release_year, poster_url, overview, runtime_minutes",
    )
    .eq("id", mediaId)
    .maybeSingle<MediaTitleRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapMedia(data) : null;
}

export async function hasWatchedMedia(
  accessToken: string,
  userId: string,
  mediaId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("watch_events")
    .select("id")
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return (data?.length ?? 0) > 0;
}

export async function isMediaRanked(
  accessToken: string,
  userId: string,
  mediaId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("ranking_entries")
    .select("media_id")
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    .maybeSingle<{ media_id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function findActiveRankingSession(
  accessToken: string,
  userId: string,
  mediaType: MediaType,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("ranking_sessions")
    .select(
      "id, user_id, candidate_media_id, media_type, low_index, high_index, status, created_at, updated_at",
    )
    .eq("user_id", userId)
    .eq("media_type", mediaType)
    .eq("status", "active")
    .maybeSingle<RankingSessionRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getRankingSession(
  accessToken: string,
  userId: string,
  sessionId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("ranking_sessions")
    .select(
      "id, user_id, candidate_media_id, media_type, low_index, high_index, status, created_at, updated_at",
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle<RankingSessionRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createRankingSession(
  accessToken: string,
  input: {
    userId: string;
    candidateMediaId: string;
    mediaType: MediaType;
    highIndex: number;
  },
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("ranking_sessions")
    .insert({
      user_id: input.userId,
      candidate_media_id: input.candidateMediaId,
      media_type: input.mediaType,
      low_index: 0,
      high_index: input.highIndex,
      status: "active",
    })
    .select(
      "id, user_id, candidate_media_id, media_type, low_index, high_index, status, created_at, updated_at",
    )
    .single<RankingSessionRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateRankingSessionBounds(
  accessToken: string,
  userId: string,
  sessionId: string,
  lowIndex: number,
  highIndex: number,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("ranking_sessions")
    .update({
      low_index: lowIndex,
      high_index: highIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .eq("status", "active")
    .select(
      "id, user_id, candidate_media_id, media_type, low_index, high_index, status, created_at, updated_at",
    )
    .single<RankingSessionRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function countRankingComparisons(
  accessToken: string,
  userId: string,
  sessionId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { count, error } = await supabase
    .from("ranking_comparisons")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function saveRankingComparison(
  accessToken: string,
  input: {
    userId: string;
    sessionId: string;
    mediaType: MediaType;
    candidateMediaId: string;
    opponentMediaId: string;
    winnerMediaId: string;
    loserMediaId: string;
  },
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase.from("ranking_comparisons").insert({
    user_id: input.userId,
    session_id: input.sessionId,
    media_type: input.mediaType,
    candidate_media_id: input.candidateMediaId,
    opponent_media_id: input.opponentMediaId,
    winner_media_id: input.winnerMediaId,
    loser_media_id: input.loserMediaId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function finalizeRankingSession(
  accessToken: string,
  sessionId: string,
  position: number,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase.rpc("finalize_ranking_session", {
    p_session_id: sessionId,
    p_position: position,
  });

  if (error) {
    throw new Error(error.message);
  }
}
