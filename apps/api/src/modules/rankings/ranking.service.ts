import type {
  MediaType,
  RankingEntry,
  RankingSessionActive,
  RankingSessionCompleted,
  RankingSessionResult,
  WatchedItem,
} from "@watchnotes/shared";
import { getWatched } from "../library/library.service.js";
import {
  applyComparison,
  estimateRemainingComparisons,
  getComparisonIndex,
} from "./ranking.algorithm.js";
import {
  countRankingComparisons,
  createRankingSession,
  finalizeRankingSession,
  findActiveRankingSession,
  getMediaTitle,
  getRankingSession,
  hasWatchedMedia,
  isMediaRanked,
  listRankingEntries,
  saveRankingComparison,
  type RankingSessionRow,
  updateRankingSessionBounds,
} from "./ranking.repository.js";

async function buildActiveState(
  accessToken: string,
  userId: string,
  session: RankingSessionRow,
  entries: RankingEntry[],
): Promise<RankingSessionActive> {
  const candidate = await getMediaTitle(
    accessToken,
    session.candidate_media_id,
  );

  if (!candidate) {
    throw new Error("The title being ranked could not be found.");
  }

  const opponentIndex = getComparisonIndex({
    low: session.low_index,
    high: session.high_index,
  });

  if (opponentIndex === null) {
    throw new Error("This ranking session is ready to be finalized.");
  }

  const opponent = entries[opponentIndex];

  if (!opponent) {
    throw new Error("The ranking changed while this comparison was in progress.");
  }

  const completedComparisons = await countRankingComparisons(
    accessToken,
    userId,
    session.id,
  );

  return {
    status: "active",
    sessionId: session.id,
    mediaType: session.media_type,
    candidate,
    opponent,
    comparisonNumber: completedComparisons + 1,
    estimatedRemaining: estimateRemainingComparisons({
      low: session.low_index,
      high: session.high_index,
    }),
  };
}

async function completeSession(
  accessToken: string,
  session: RankingSessionRow,
  candidateTitle: NonNullable<Awaited<ReturnType<typeof getMediaTitle>>>,
  rankingCountBeforeInsert: number,
): Promise<RankingSessionCompleted> {
  const position = session.low_index + 1;

  await finalizeRankingSession(accessToken, session.id, position);

  return {
    status: "completed",
    mediaType: session.media_type,
    candidate: candidateTitle,
    position,
    rankingCount: rankingCountBeforeInsert + 1,
  };
}

export function getRanking(
  accessToken: string,
  userId: string,
  mediaType: MediaType,
) {
  return listRankingEntries(accessToken, userId, mediaType);
}

export async function getUnrankedWatched(
  accessToken: string,
  userId: string,
  mediaType: MediaType,
): Promise<WatchedItem[]> {
  const [watched, ranking] = await Promise.all([
    getWatched(accessToken, userId),
    listRankingEntries(accessToken, userId, mediaType),
  ]);

  const rankedIds = new Set(ranking.map((entry) => entry.media.id));

  return watched.filter(
    (item) => item.media.type === mediaType && !rankedIds.has(item.media.id),
  );
}

export async function getActiveRanking(
  accessToken: string,
  userId: string,
  mediaType: MediaType,
): Promise<RankingSessionActive | null> {
  const session = await findActiveRankingSession(
    accessToken,
    userId,
    mediaType,
  );

  if (!session) {
    return null;
  }

  const entries = await listRankingEntries(accessToken, userId, mediaType);

  if (session.low_index === session.high_index) {
    const candidate = await getMediaTitle(
      accessToken,
      session.candidate_media_id,
    );

    if (!candidate) {
      throw new Error("The title being ranked could not be found.");
    }

    await completeSession(accessToken, session, candidate, entries.length);
    return null;
  }

  return buildActiveState(accessToken, userId, session, entries);
}

export async function startRanking(
  accessToken: string,
  userId: string,
  mediaType: MediaType,
  mediaId: string,
): Promise<RankingSessionResult> {
  const candidate = await getMediaTitle(accessToken, mediaId);

  if (!candidate || candidate.type !== mediaType) {
    throw new Error("That title does not match this ranking.");
  }

  if (!(await hasWatchedMedia(accessToken, userId, mediaId))) {
    throw new Error("Only watched titles can be ranked.");
  }

  if (await isMediaRanked(accessToken, userId, mediaId)) {
    throw new Error("That title is already in your ranking.");
  }

  const existingSession = await findActiveRankingSession(
    accessToken,
    userId,
    mediaType,
  );

  if (existingSession) {
    if (existingSession.candidate_media_id !== mediaId) {
      const activeCandidate = await getMediaTitle(
        accessToken,
        existingSession.candidate_media_id,
      );

      throw new Error(
        `Finish ranking ${activeCandidate?.title ?? "your current title"} first.`,
      );
    }

    const entries = await listRankingEntries(accessToken, userId, mediaType);

    if (existingSession.low_index === existingSession.high_index) {
      return completeSession(
        accessToken,
        existingSession,
        candidate,
        entries.length,
      );
    }

    return buildActiveState(
      accessToken,
      userId,
      existingSession,
      entries,
    );
  }

  const entries = await listRankingEntries(accessToken, userId, mediaType);
  const session = await createRankingSession(accessToken, {
    userId,
    candidateMediaId: mediaId,
    mediaType,
    highIndex: entries.length,
  });

  if (entries.length === 0) {
    return completeSession(accessToken, session, candidate, 0);
  }

  return buildActiveState(accessToken, userId, session, entries);
}

export async function answerRankingComparison(
  accessToken: string,
  userId: string,
  mediaType: MediaType,
  sessionId: string,
  preferredMediaId: string,
): Promise<RankingSessionResult> {
  const session = await getRankingSession(accessToken, userId, sessionId);

  if (!session || session.status !== "active" || session.media_type !== mediaType) {
    throw new Error("That ranking session is no longer active.");
  }

  const candidate = await getMediaTitle(
    accessToken,
    session.candidate_media_id,
  );

  if (!candidate) {
    throw new Error("The title being ranked could not be found.");
  }

  const entries = await listRankingEntries(accessToken, userId, mediaType);

  if (session.low_index === session.high_index) {
    return completeSession(
      accessToken,
      session,
      candidate,
      entries.length,
    );
  }

  const opponentIndex = getComparisonIndex({
    low: session.low_index,
    high: session.high_index,
  });

  if (opponentIndex === null) {
    return completeSession(
      accessToken,
      session,
      candidate,
      entries.length,
    );
  }

  const opponent = entries[opponentIndex];

  if (!opponent) {
    throw new Error("The ranking changed while this comparison was in progress.");
  }

  if (
    preferredMediaId !== candidate.id &&
    preferredMediaId !== opponent.media.id
  ) {
    throw new Error("Choose one of the two titles in this comparison.");
  }

  const candidatePreferred = preferredMediaId === candidate.id;
  const winnerMediaId = candidatePreferred ? candidate.id : opponent.media.id;
  const loserMediaId = candidatePreferred ? opponent.media.id : candidate.id;

  await saveRankingComparison(accessToken, {
    userId,
    sessionId,
    mediaType,
    candidateMediaId: candidate.id,
    opponentMediaId: opponent.media.id,
    winnerMediaId,
    loserMediaId,
  });

  const nextBounds = applyComparison(
    {
      low: session.low_index,
      high: session.high_index,
    },
    opponentIndex,
    candidatePreferred,
  );

  const updatedSession = await updateRankingSessionBounds(
    accessToken,
    userId,
    sessionId,
    nextBounds.low,
    nextBounds.high,
  );

  if (nextBounds.low === nextBounds.high) {
    return completeSession(
      accessToken,
      updatedSession,
      candidate,
      entries.length,
    );
  }

  return buildActiveState(
    accessToken,
    userId,
    updatedSession,
    entries,
  );
}
