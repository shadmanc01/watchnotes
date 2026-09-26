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
    <div className="rank-queue">
      {items.map((item) => (
        <article className="rank-queue__item" key={item.media.id}>
          {item.media.posterUrl ? (
            <img
              className="rank-queue__poster"
              src={item.media.posterUrl}
              alt=""
              width={56}
            />
          ) : (
            <div
              className="rank-queue__poster poster-placeholder"
              aria-hidden="true"
            />
          )}

          <div>
            <strong>{item.media.title}</strong>
            <p>
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
