import type { RankingEntry } from "@watchnotes/shared";

type RankingListProps = {
  entries: RankingEntry[];
};

export function RankingList({ entries }: RankingListProps) {
  if (entries.length === 0) {
    return <p>No ranked titles yet.</p>;
  }

  return (
    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {entries.map((entry) => (
        <li
          key={entry.media.id}
          style={{
            display: "grid",
            gridTemplateColumns: "48px 56px 1fr",
            gap: 12,
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid #ddd",
          }}
        >
          <strong style={{ fontSize: 22 }}>#{entry.position}</strong>

          {entry.media.posterUrl ? (
            <img
              src={entry.media.posterUrl}
              alt=""
              width={56}
              style={{
                width: 56,
                height: 84,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{ width: 56, height: 84, background: "#e8e8e8" }}
            />
          )}

          <div>
            <strong>{entry.media.title}</strong>
            {entry.media.releaseYear ? (
              <p style={{ margin: "4px 0 0" }}>{entry.media.releaseYear}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
