import type {
  LibraryMediaReference,
  LibraryTitleDetail,
  MediaNote,
} from "@watchnotes/shared";
import { getTmdbMediaDetails } from "../../integrations/tmdb/tmdb.client.js";
import {
  addWatchEvent,
  addWatchlistItem,
  countWatchEvents,
  deleteMediaNote,
  getMediaNote,
  getMediaTitleById,
  getRankingPositionForMedia,
  isMediaOnWatchlist,
  listWatchEventsForMedia,
  listWatched,
  listWatchlist,
  removeWatchlistItem,
  upsertMediaNote,
  upsertMediaTitle,
} from "./library.repository.js";

export async function saveToWatchlist(
  accessToken: string,
  userId: string,
  mediaReference: LibraryMediaReference,
) {
  const media = await getTmdbMediaDetails(
    mediaReference.type,
    mediaReference.providerId,
  );
  const mediaId = await upsertMediaTitle(accessToken, media);

  await addWatchlistItem(accessToken, userId, mediaId);

  return media;
}

export async function markAsWatched(
  accessToken: string,
  userId: string,
  mediaReference: LibraryMediaReference,
) {
  const media = await getTmdbMediaDetails(
    mediaReference.type,
    mediaReference.providerId,
  );
  const mediaId = await upsertMediaTitle(accessToken, media);
  const previousWatchCount = await countWatchEvents(
    accessToken,
    userId,
    mediaId,
  );

  await addWatchEvent(accessToken, {
    userId,
    mediaId,
    runtimeMinutes: media.type === "movie" ? media.runtimeMinutes : null,
    isRewatch: previousWatchCount > 0,
  });

  await removeWatchlistItem(accessToken, userId, mediaId);

  return {
    media,
    isRewatch: previousWatchCount > 0,
  };
}

export function getWatchlist(accessToken: string, userId: string) {
  return listWatchlist(accessToken, userId);
}

export function getWatched(accessToken: string, userId: string) {
  return listWatched(accessToken, userId);
}

export async function getLibraryTitleDetail(
  accessToken: string,
  userId: string,
  mediaId: string,
): Promise<LibraryTitleDetail> {
  const media = await getMediaTitleById(accessToken, mediaId);

  if (!media) {
    throw new Error("Title not found.");
  }

  const [watchEvents, rankingPosition, note, onWatchlist] = await Promise.all([
    listWatchEventsForMedia(accessToken, userId, mediaId),
    getRankingPositionForMedia(accessToken, userId, mediaId),
    getMediaNote(accessToken, userId, mediaId),
    isMediaOnWatchlist(accessToken, userId, mediaId),
  ]);

  return {
    media,
    watchCount: watchEvents.length,
    trackedRuntimeMinutes: watchEvents.reduce(
      (total, event) => total + (event.runtimeMinutes ?? 0),
      0,
    ),
    lastWatchedAt: watchEvents[0]?.watchedAt ?? null,
    watchEvents,
    rankingPosition,
    note,
    onWatchlist,
  };
}

export async function saveMediaNote(
  accessToken: string,
  userId: string,
  mediaId: string,
  body: string,
): Promise<MediaNote> {
  const normalizedBody = body.trim();

  if (normalizedBody.length === 0) {
    throw new Error("Write something before saving your note.");
  }

  if (normalizedBody.length > 2000) {
    throw new Error("Notes can be up to 2,000 characters.");
  }

  const watchCount = await countWatchEvents(accessToken, userId, mediaId);

  if (watchCount === 0) {
    throw new Error("Mark this title watched before adding a note.");
  }

  return upsertMediaNote(
    accessToken,
    userId,
    mediaId,
    normalizedBody,
  );
}

export async function removeMediaNote(
  accessToken: string,
  userId: string,
  mediaId: string,
) {
  await deleteMediaNote(accessToken, userId, mediaId);
}
