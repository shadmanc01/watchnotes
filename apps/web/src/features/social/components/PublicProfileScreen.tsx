"use client";

import type {
  MediaType,
  RankingEntry,
  SocialProfile,
  SocialViewerState,
  TasteMatchResult,
} from "@watchnotes/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "../../../components/layout/PageContainer";
import {
  followUser,
  getPublicRanking,
  getSocialProfile,
  getSocialViewer,
  getTasteMatch,
  unfollowUser,
} from "../api/social.api";
import styles from "./PublicProfile.module.css";
import { PublicRankingList } from "./PublicRankingList";
import { TasteMatchPanel } from "./TasteMatchPanel";

type PublicProfileScreenProps = {
  username: string;
};

const signedOutViewer: SocialViewerState = {
  authenticated: false,
  isSelf: false,
  isFollowing: false,
};

function initials(profile: SocialProfile["profile"]) {
  const value = profile.displayName || profile.username;
  return value.slice(0, 2).toUpperCase();
}

export function PublicProfileScreen({
  username,
}: PublicProfileScreenProps) {
  const [socialProfile, setSocialProfile] = useState<SocialProfile | null>(null);
  const [viewer, setViewer] = useState<SocialViewerState>(signedOutViewer);
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [tasteMatch, setTasteMatch] = useState<TasteMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRankingLoading, setIsRankingLoading] = useState(true);
  const [isTasteLoading, setIsTasteLoading] = useState(false);
  const [isFollowSaving, setIsFollowSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRanking = useCallback(
    async (type: MediaType) => {
      setIsRankingLoading(true);

      try {
        const response = await getPublicRanking(username, type);
        setEntries(response.entries);
      } catch (rankingError) {
        setError(
          rankingError instanceof Error
            ? rankingError.message
            : "Unable to load this ranking.",
        );
      } finally {
        setIsRankingLoading(false);
      }
    },
    [username],
  );

  useEffect(() => {
    Promise.all([getSocialProfile(username), getSocialViewer(username)])
      .then(([profileResponse, viewerResponse]) => {
        setSocialProfile(profileResponse.socialProfile);
        setViewer(viewerResponse.viewer);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this profile.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [username]);

  useEffect(() => {
    void loadRanking(mediaType);
  }, [loadRanking, mediaType]);

  useEffect(() => {
    if (!viewer.authenticated || viewer.isSelf) {
      setTasteMatch(null);
      setIsTasteLoading(false);
      return;
    }

    setIsTasteLoading(true);

    getTasteMatch(username, mediaType)
      .then((response) => setTasteMatch(response.tasteMatch))
      .catch((matchError) => {
        setTasteMatch(null);
        setError(
          matchError instanceof Error
            ? matchError.message
            : "Unable to compare rankings.",
        );
      })
      .finally(() => setIsTasteLoading(false));
  }, [mediaType, username, viewer.authenticated, viewer.isSelf]);

  async function handleFollowToggle() {
    if (!socialProfile || !viewer.authenticated || viewer.isSelf) {
      return;
    }

    setIsFollowSaving(true);
    setError(null);

    try {
      if (viewer.isFollowing) {
        await unfollowUser(username);
      } else {
        await followUser(username);
      }

      const nextFollowing = !viewer.isFollowing;

      setViewer((current) => ({
        ...current,
        isFollowing: nextFollowing,
      }));

      setSocialProfile((current) =>
        current
          ? {
              ...current,
              followersCount: Math.max(
                0,
                current.followersCount + (nextFollowing ? 1 : -1),
              ),
            }
          : current,
      );
    } catch (followError) {
      setError(
        followError instanceof Error
          ? followError.message
          : "Unable to update follow.",
      );
    } finally {
      setIsFollowSaving(false);
    }
  }

  if (isLoading) {
    return <PageContainer>Loading profile...</PageContainer>;
  }

  if (error && !socialProfile) {
    return (
      <PageContainer>
        <section className="content-narrow">
          <p className="page-kicker">Profile</p>
          <h1 className="page-title">Profile unavailable.</h1>
          <p className="status-message">{error}</p>
        </section>
      </PageContainer>
    );
  }

  if (!socialProfile) {
    return null;
  }

  const { profile } = socialProfile;

  return (
    <PageContainer>
      <section className={styles.profileHeader}>
        <div className={styles.avatar}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" />
          ) : (
            <span>{initials(profile)}</span>
          )}
        </div>

        <div className={styles.profileCopy}>
          <p className="page-kicker">Public profile</p>
          <h1>{profile.displayName || profile.username}</h1>
          <p className={styles.username}>@{profile.username}</p>

          {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : null}

          <div className={styles.counts}>
            <span>
              <strong>{socialProfile.followersCount}</strong> followers
            </span>
            <span>
              <strong>{socialProfile.followingCount}</strong> following
            </span>
          </div>

          <div className={styles.profileActions}>
            {viewer.isSelf ? (
              <Link className="cta-link cta-link--secondary" href="/account">
                Account
              </Link>
            ) : viewer.authenticated ? (
              <button
                type="button"
                disabled={isFollowSaving}
                onClick={() => void handleFollowToggle()}
              >
                {isFollowSaving
                  ? "Saving..."
                  : viewer.isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            ) : (
              <Link className="cta-link" href="/login">
                Sign in to follow
              </Link>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <p className="status-message" role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.tabsTop}>
        {(["movie", "tv"] as const).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={mediaType === type}
            onClick={() => {
              setMediaType(type);
              setError(null);
            }}
          >
            {type === "movie" ? "Movies" : "TV Shows"}
          </button>
        ))}
      </div>

      <TasteMatchPanel
        username={profile.username}
        viewer={viewer}
        tasteMatch={tasteMatch}
        isLoading={isTasteLoading}
      />

      <section className={styles.rankingSection}>
        <div className={styles.rankingHeader}>
          <div>
            <p className="page-kicker">Taste</p>
            <h2>{mediaType === "movie" ? "Movie" : "TV"} ranking</h2>
          </div>
        </div>

        {isRankingLoading ? (
          <p>Loading ranking...</p>
        ) : (
          <PublicRankingList
            username={profile.username}
            mediaType={mediaType}
            entries={entries}
            viewer={viewer}
          />
        )}
      </section>
    </PageContainer>
  );
}
