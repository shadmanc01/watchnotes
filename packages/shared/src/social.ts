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
