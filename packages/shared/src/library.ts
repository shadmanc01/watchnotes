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

export type WatchEventSummary = {
  watchedAt: string;
  runtimeMinutes: number | null;
  isRewatch: boolean;
};

export type MediaNote = {
  body: string;
  updatedAt: string;
};

export type LibraryTitleDetail = {
  media: MediaSummary;
  watchCount: number;
  trackedRuntimeMinutes: number;
  lastWatchedAt: string | null;
  watchEvents: WatchEventSummary[];
  rankingPosition: number | null;
  note: MediaNote | null;
  onWatchlist: boolean;
};
