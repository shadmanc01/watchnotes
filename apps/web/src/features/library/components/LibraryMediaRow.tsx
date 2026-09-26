import type { MediaSummary } from "@watchnotes/shared";
import Link from "next/link";

type LibraryMediaRowProps = {
  media: MediaSummary;
  detail?: string;
};

export function LibraryMediaRow({ media, detail }: LibraryMediaRowProps) {
  return (
    <article className="library-row">
      <Link href={`/title/${media.id}`} aria-label={`Open ${media.title}`}>
        {media.posterUrl ? (
          <img
            className="library-row__poster"
            src={media.posterUrl}
            alt=""
            width={72}
          />
        ) : (
          <div
            className="library-row__poster poster-placeholder"
            aria-hidden="true"
          />
        )}
      </Link>

      <div>
        <p className="media-meta">
          {media.type === "movie" ? "Movie" : "TV Show"}
        </p>
        <h2 className="library-row__title">
          <Link href={`/title/${media.id}`}>
            {media.title}
            {media.releaseYear ? ` (${media.releaseYear})` : ""}
          </Link>
        </h2>
        {detail ? <p className="library-row__detail">{detail}</p> : null}
      </div>
    </article>
  );
}
