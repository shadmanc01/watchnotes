import type { LibraryMediaReference } from "@watchnotes/shared";
import { getTmdbMediaDetails } from "../../integrations/tmdb/tmdb.client.js";
import {
  addWatchEvent,
  addWatchlistItem,
  countWatchEvents,
  listWatched,
  listWatchlist,
  removeWatchlistItem,
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
