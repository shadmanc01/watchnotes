import type { RankingSessionActive } from "@watchnotes/shared";
import { RankingMediaCard } from "./RankingMediaCard";

type ComparisonArenaProps = {
  session: RankingSessionActive;
  isSubmitting: boolean;
  onChoose: (mediaId: string) => void;
};

export function ComparisonArena({
  session,
  isSubmitting,
  onChoose,
}: ComparisonArenaProps) {
  return (
    <section className="comparison-arena">
      <p className="comparison-arena__kicker">Head-to-head ranking</p>
      <h2>Which did you prefer?</h2>
      <p className="comparison-arena__meta">
        Comparison {session.comparisonNumber}
        {session.estimatedRemaining > 0
          ? ` · about ${session.estimatedRemaining} left`
          : ""}
      </p>

      <div className="comparison-grid">
        <button
          className="comparison-choice"
          type="button"
          disabled={isSubmitting}
          onClick={() => onChoose(session.candidate.id)}
        >
          <RankingMediaCard media={session.candidate} eyebrow="New title" />
        </button>

        <button
          className="comparison-choice"
          type="button"
          disabled={isSubmitting}
          onClick={() => onChoose(session.opponent.media.id)}
        >
          <RankingMediaCard
            media={session.opponent.media}
            eyebrow={`Currently #${session.opponent.position}`}
          />
        </button>
      </div>
    </section>
  );
}
