import type { WatchedItem } from "@watchnotes/shared";

type RankQueueProps = {
  items: WatchedItem[];
  disabled: boolean;
  onStart: (mediaId: string) => void;
};

export function RankQueue({ items, disabled, onStart }: RankQueueProps) {
  if (items.length === 0) {
    return <p>Everything you have watched in this category is ranked.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((item) => (
        <article
          key={item.media.id}
          style={{
            display: "grid",
            gridTemplateColumns: "56px 1fr auto",
            gap: 12,
            alignItems: "center",
            padding: "10px 0",
            borderBottom: "1px solid #ddd",
          }}
        >
          {item.media.posterUrl ? (
            <img
              src={item.media.posterUrl}
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
            <strong>{item.media.title}</strong>
            <p style={{ margin: "4px 0 0" }}>
              {item.watchCount === 1
                ? "Watched once"
                : `Watched ${item.watchCount} times`}
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onStart(item.media.id)}
          >
            Rank
          </button>
        </article>
      ))}
    </div>
  );
}
