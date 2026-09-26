import type {
  MediaType,
  RankingEntry,
  TasteMatchResult,
  TasteMatchTitle,
} from "@watchnotes/shared";

const MINIMUM_SHARED_TITLES = 3;

function normalizedPosition(position: number, total: number) {
  if (total <= 1) {
    return 0;
  }

  return (position - 1) / (total - 1);
}

function buildSharedTitles(
  viewerEntries: RankingEntry[],
  targetEntries: RankingEntry[],
): TasteMatchTitle[] {
  const targetByMediaId = new Map(
    targetEntries.map((entry) => [entry.media.id, entry]),
  );

  return viewerEntries.flatMap((viewerEntry) => {
    const targetEntry = targetByMediaId.get(viewerEntry.media.id);

    if (!targetEntry) {
      return [];
    }

    const viewerPercentile = normalizedPosition(
      viewerEntry.position,
      viewerEntries.length,
    );
    const targetPercentile = normalizedPosition(
      targetEntry.position,
      targetEntries.length,
    );

    return [
      {
        media: viewerEntry.media,
        yourPosition: viewerEntry.position,
        theirPosition: targetEntry.position,
        percentileGap: Math.round(
          Math.abs(viewerPercentile - targetPercentile) * 100,
        ),
      },
    ];
  });
}

function calculatePairAgreement(sharedTitles: TasteMatchTitle[]) {
  let agreeingPairs = 0;
  let totalPairs = 0;

  for (let firstIndex = 0; firstIndex < sharedTitles.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < sharedTitles.length;
      secondIndex += 1
    ) {
      const first = sharedTitles[firstIndex];
      const second = sharedTitles[secondIndex];

      if (!first || !second) {
        continue;
      }

      totalPairs += 1;

      const viewerOrder = Math.sign(
        first.yourPosition - second.yourPosition,
      );
      const targetOrder = Math.sign(
        first.theirPosition - second.theirPosition,
      );

      if (viewerOrder === targetOrder) {
        agreeingPairs += 1;
      }
    }
  }

  return {
    agreeingPairs,
    totalPairs,
  };
}

export function calculateTasteMatch(
  mediaType: MediaType,
  viewerEntries: RankingEntry[],
  targetEntries: RankingEntry[],
): TasteMatchResult {
  const sharedTitles = buildSharedTitles(viewerEntries, targetEntries);
  const pairAgreement = calculatePairAgreement(sharedTitles);

  const score =
    sharedTitles.length >= MINIMUM_SHARED_TITLES &&
    pairAgreement.totalPairs > 0
      ? Math.round(
          (pairAgreement.agreeingPairs / pairAgreement.totalPairs) * 100,
        )
      : null;

  const agreements = [...sharedTitles]
    .sort(
      (left, right) =>
        left.percentileGap - right.percentileGap ||
        left.yourPosition - right.yourPosition,
    )
    .slice(0, 3);

  const disagreements = [...sharedTitles]
    .sort(
      (left, right) =>
        right.percentileGap - left.percentileGap ||
        left.yourPosition - right.yourPosition,
    )
    .slice(0, 3);

  return {
    mediaType,
    score,
    sharedCount: sharedTitles.length,
    minimumSharedCount: MINIMUM_SHARED_TITLES,
    yourRankedCount: viewerEntries.length,
    theirRankedCount: targetEntries.length,
    pairComparisons: pairAgreement.totalPairs,
    agreements,
    disagreements,
  };
}
