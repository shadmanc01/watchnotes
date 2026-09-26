import type {
  MediaType,
  SocialProfile,
  SocialViewerState,
} from "@watchnotes/shared";
import { getProfileByUsername } from "../profiles/profile.service.js";
import {
  createFollow,
  deleteFollow,
  getFollowCounts,
  getIsFollowing,
  isMediaRankedByUser,
  listPublicRanking,
  saveMediaFromProfile,
} from "./social.repository.js";

async function requireProfile(username: string) {
  const profile = await getProfileByUsername(username);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  return profile;
}

export async function getSocialProfile(
  username: string,
): Promise<SocialProfile> {
  const profile = await requireProfile(username);
  const counts = await getFollowCounts(profile.id);

  return {
    profile,
    ...counts,
  };
}

export async function getPublicProfileRanking(
  username: string,
  mediaType: MediaType,
) {
  const profile = await requireProfile(username);
  return listPublicRanking(profile.id, mediaType);
}

export async function getSocialViewerState(
  accessToken: string | null,
  viewerUserId: string | null,
  username: string,
): Promise<SocialViewerState> {
  const profile = await requireProfile(username);

  if (!accessToken || !viewerUserId) {
    return {
      authenticated: false,
      isSelf: false,
      isFollowing: false,
    };
  }

  if (viewerUserId === profile.id) {
    return {
      authenticated: true,
      isSelf: true,
      isFollowing: false,
    };
  }

  return {
    authenticated: true,
    isSelf: false,
    isFollowing: await getIsFollowing(
      accessToken,
      viewerUserId,
      profile.id,
    ),
  };
}

export async function followProfile(
  accessToken: string,
  viewerUserId: string,
  username: string,
) {
  const profile = await requireProfile(username);

  if (profile.id === viewerUserId) {
    throw new Error("You cannot follow yourself.");
  }

  await createFollow(accessToken, viewerUserId, profile.id);
}

export async function unfollowProfile(
  accessToken: string,
  viewerUserId: string,
  username: string,
) {
  const profile = await requireProfile(username);

  if (profile.id === viewerUserId) {
    throw new Error("You cannot unfollow yourself.");
  }

  await deleteFollow(accessToken, viewerUserId, profile.id);
}

export async function saveFromProfileRanking(
  accessToken: string,
  viewerUserId: string,
  username: string,
  mediaType: MediaType,
  mediaId: string,
) {
  const profile = await requireProfile(username);

  if (profile.id === viewerUserId) {
    throw new Error("Use your own watchlist to save titles from your ranking.");
  }

  const belongsToRanking = await isMediaRankedByUser(
    profile.id,
    mediaType,
    mediaId,
  );

  if (!belongsToRanking) {
    throw new Error("That title is not in this user's ranking.");
  }

  await saveMediaFromProfile(
    accessToken,
    viewerUserId,
    mediaId,
    profile.id,
  );
}
