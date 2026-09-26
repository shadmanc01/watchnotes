import type { MediaSummary, MediaType } from "./media.js";
import type { PublicProfile } from "./profile.js";

export type SocialProfile = {
  profile: PublicProfile;
  followersCount: number;
  followingCount: number;
};

export type SocialViewerState = {
  authenticated: boolean;
  isSelf: boolean;
  isFollowing: boolean;
};

export type TasteMatchTitle = {
  media: MediaSummary;
  yourPosition: number;
  theirPosition: number;
  percentileGap: number;
};

export type TasteMatchResult = {
  mediaType: MediaType;
  score: number | null;
  sharedCount: number;
  minimumSharedCount: number;
  yourRankedCount: number;
  theirRankedCount: number;
  pairComparisons: number;
  agreements: TasteMatchTitle[];
  disagreements: TasteMatchTitle[];
};
