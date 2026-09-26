import type { RankingEntry } from "@watchnotes/shared";
import Link from "next/link";

type RankingListProps = {
  entries: RankingEntry[];
};

export function RankingList({ entries }: RankingListProps) {
  if (entries.length === 0) {
    return <p>No ranked titles yet.</p>;
  }

  return (
    <ol className="ranking-list">
      {entries.map((entry) => (
        <li className="ranking-row" key={entry.media.id}>
          <strong className="ranking-row__position">#{entry.position}</strong>

          <Link
            href={`/title/${entry.media.id}`}
            aria-label={`Open ${entry.media.title}`}
          >
            {entry.media.posterUrl ? (
              <img
                className="ranking-row__poster"
                src={entry.media.posterUrl}
                alt=""
                width={56}
              />
            ) : (
              <div
                className="ranking-row__poster poster-placeholder"
                aria-hidden="true"
              />
            )}
          </Link>

          <div>
            <strong>
              <Link href={`/title/${entry.media.id}`}>
                {entry.media.title}
              </Link>
            </strong>
            {entry.media.releaseYear ? <p>{entry.media.releaseYear}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
