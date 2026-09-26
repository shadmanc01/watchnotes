import type { MediaSummary, MediaType } from "./media.js";

export type LibraryMediaReference = {
  providerId: number;
  type: MediaType;
};

export type WatchlistItem = {
  media: MediaSummary;
  addedAt: string;
  sourceUserId: string | null;
};

export type WatchedItem = {
  media: MediaSummary;
  lastWatchedAt: string;
  watchCount: number;
  trackedRuntimeMinutes: number;
  untrackedWatchCount: number;
};
