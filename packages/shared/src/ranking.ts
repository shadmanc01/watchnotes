import type { MediaSummary, MediaType } from "./media.js";

export type RankingEntry = {
  position: number;
  media: MediaSummary;
  rankedAt: string;
};

export type RankingSessionActive = {
  status: "active";
  sessionId: string;
  mediaType: MediaType;
  candidate: MediaSummary;
  opponent: RankingEntry;
  comparisonNumber: number;
  estimatedRemaining: number;
};

export type RankingSessionCompleted = {
  status: "completed";
  mediaType: MediaType;
  candidate: MediaSummary;
  position: number;
  rankingCount: number;
};

export type RankingSessionResult =
  | RankingSessionActive
  | RankingSessionCompleted;
