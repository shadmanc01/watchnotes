import type {
  MediaSummary,
  MediaType,
  RankingEntry,
} from "@watchnotes/shared";
import {
  createAuthenticatedSupabaseClient,
  createSupabaseClient,
} from "../../integrations/supabase/supabase.client.js";

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

export async function getFollowCounts(userId: string) {
  const supabase = createSupabaseClient();

  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_user_id", {
        count: "exact",
        head: true,
      })
      .eq("following_user_id", userId),
    supabase
      .from("follows")
      .select("following_user_id", {
        count: "exact",
        head: true,
      })
      .eq("follower_user_id", userId),
  ]);

  if (followersResult.error) {
    throw new Error(followersResult.error.message);
  }

  if (followingResult.error) {
    throw new Error(followingResult.error.message);
  }

  return {
    followersCount: followersResult.count ?? 0,
    followingCount: followingResult.count ?? 0,
  };
}

export async function listPublicRanking(
  userId: string,
  mediaType: MediaType,
): Promise<RankingEntry[]> {
  const supabase = createSupabaseClient();
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

export async function getIsFollowing(
  accessToken: string,
  followerUserId: string,
  followingUserId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("follows")
    .select("following_user_id")
    .eq("follower_user_id", followerUserId)
    .eq("following_user_id", followingUserId)
    .maybeSingle<{ following_user_id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function createFollow(
  accessToken: string,
  followerUserId: string,
  followingUserId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase.from("follows").upsert(
    {
      follower_user_id: followerUserId,
      following_user_id: followingUserId,
    },
    {
      onConflict: "follower_user_id,following_user_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteFollow(
  accessToken: string,
  followerUserId: string,
  followingUserId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_user_id", followerUserId)
    .eq("following_user_id", followingUserId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function isMediaRankedByUser(
  sourceUserId: string,
  mediaType: MediaType,
  mediaId: string,
) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("ranking_entries")
    .select("media_id")
    .eq("user_id", sourceUserId)
    .eq("media_type", mediaType)
    .eq("media_id", mediaId)
    .maybeSingle<{ media_id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function saveMediaFromProfile(
  accessToken: string,
  userId: string,
  mediaId: string,
  sourceUserId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase.from("watchlist_items").upsert(
    {
      user_id: userId,
      media_id: mediaId,
      source_user_id: sourceUserId,
      source_type: "profile",
    },
    {
      onConflict: "user_id,media_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
