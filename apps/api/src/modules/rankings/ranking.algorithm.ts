export type RankingBounds = {
  low: number;
  high: number;
};

export function getComparisonIndex({ low, high }: RankingBounds) {
  if (low < 0 || high < low) {
    throw new Error("Invalid ranking bounds.");
  }

  if (low === high) {
    return null;
  }

  return Math.floor((low + high) / 2);
}

export function applyComparison(
  bounds: RankingBounds,
  opponentIndex: number,
  candidatePreferred: boolean,
): RankingBounds {
  if (opponentIndex < bounds.low || opponentIndex >= bounds.high) {
    throw new Error("Comparison opponent is outside the active ranking range.");
  }

  return candidatePreferred
    ? {
        low: bounds.low,
        high: opponentIndex,
      }
    : {
        low: opponentIndex + 1,
        high: bounds.high,
      };
}

export function estimateRemainingComparisons(bounds: RankingBounds) {
  const possiblePositions = bounds.high - bounds.low + 1;

  if (possiblePositions <= 1) {
    return 0;
  }

  return Math.ceil(Math.log2(possiblePositions));
}
