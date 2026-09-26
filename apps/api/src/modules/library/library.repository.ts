import type {
  MediaSummary,
  WatchedItem,
  WatchlistItem,
} from "@watchnotes/shared";
import { createAuthenticatedSupabaseClient } from "../../integrations/supabase/supabase.client.js";

type MediaTitleRow = {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  release_year: number | null;
  poster_url: string | null;
  overview: string | null;
  runtime_minutes: number | null;
};

type WatchlistJoinRow = {
  created_at: string;
  source_user_id: string | null;
  media_titles: MediaTitleRow | MediaTitleRow[] | null;
};

type WatchEventJoinRow = {
  watched_at: string;
  runtime_minutes: number | null;
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

export async function upsertMediaTitle(
  accessToken: string,
  media: MediaSummary,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("media_titles")
    .upsert(
      {
        tmdb_id: media.providerId,
        media_type: media.type,
        title: media.title,
        release_year: media.releaseYear,
        poster_url: media.posterUrl,
        overview: media.overview,
        runtime_minutes: media.runtimeMinutes,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "tmdb_id,media_type",
      },
    )
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function addWatchlistItem(
  accessToken: string,
  userId: string,
  mediaId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase.from("watchlist_items").upsert(
    {
      user_id: userId,
      media_id: mediaId,
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

export async function removeWatchlistItem(
  accessToken: string,
  userId: string,
  mediaId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("media_id", mediaId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function countWatchEvents(
  accessToken: string,
  userId: string,
  mediaId: string,
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { count, error } = await supabase
    .from("watch_events")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("media_id", mediaId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function addWatchEvent(
  accessToken: string,
  input: {
    userId: string;
    mediaId: string;
    runtimeMinutes: number | null;
    isRewatch: boolean;
  },
) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { error } = await supabase.from("watch_events").insert({
    user_id: input.userId,
    media_id: input.mediaId,
    runtime_minutes: input.runtimeMinutes,
    is_rewatch: input.isRewatch,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listWatchlist(
  accessToken: string,
  userId: string,
): Promise<WatchlistItem[]> {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("watchlist_items")
    .select(
      "created_at, source_user_id, media_titles!inner(id, tmdb_id, media_type, title, release_year, poster_url, overview, runtime_minutes)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as WatchlistJoinRow[])
    .map((row) => {
      const media = getJoinedMedia(row.media_titles);

      if (!media) {
        return null;
      }

      return {
        media: mapMedia(media),
        addedAt: row.created_at,
        sourceUserId: row.source_user_id,
      };
    })
    .filter((item): item is WatchlistItem => item !== null);
}

export async function listWatched(
  accessToken: string,
  userId: string,
): Promise<WatchedItem[]> {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("watch_events")
    .select(
      "watched_at, runtime_minutes, media_titles!inner(id, tmdb_id, media_type, title, release_year, poster_url, overview, runtime_minutes)",
    )
    .eq("user_id", userId)
    .order("watched_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const grouped = new Map<string, WatchedItem>();

  for (const row of (data ?? []) as unknown as WatchEventJoinRow[]) {
    const mediaRow = getJoinedMedia(row.media_titles);

    if (!mediaRow) {
      continue;
    }

    const existing = grouped.get(mediaRow.id);

    if (existing) {
      existing.watchCount += 1;

      if (row.runtime_minutes === null) {
        existing.untrackedWatchCount += 1;
      } else {
        existing.trackedRuntimeMinutes += row.runtime_minutes;
      }

      continue;
    }

    grouped.set(mediaRow.id, {
      media: mapMedia(mediaRow),
      lastWatchedAt: row.watched_at,
      watchCount: 1,
      trackedRuntimeMinutes: row.runtime_minutes ?? 0,
      untrackedWatchCount: row.runtime_minutes === null ? 1 : 0,
    });
  }

  return Array.from(grouped.values());
}
