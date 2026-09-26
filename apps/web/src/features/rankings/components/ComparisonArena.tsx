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
    <section
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 24,
        marginBottom: 32,
      }}
    >
      <p style={{ marginTop: 0 }}>Head-to-head ranking</p>
      <h2>Which did you prefer?</h2>
      <p>
        Comparison {session.comparisonNumber}
        {session.estimatedRemaining > 0
          ? ` · about ${session.estimatedRemaining} left`
          : ""}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
          alignItems: "start",
          marginTop: 24,
        }}
      >
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onChoose(session.candidate.id)}
          style={{
            padding: 20,
            background: "white",
            border: "1px solid #bbb",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          <RankingMediaCard media={session.candidate} eyebrow="New title" />
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onChoose(session.opponent.media.id)}
          style={{
            padding: 20,
            background: "white",
            border: "1px solid #bbb",
            borderRadius: 12,
            cursor: "pointer",
          }}
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
