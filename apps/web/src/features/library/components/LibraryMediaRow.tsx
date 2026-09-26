import type { MediaSummary } from "@watchnotes/shared";

type LibraryMediaRowProps = {
  media: MediaSummary;
  detail?: string;
};

export function LibraryMediaRow({ media, detail }: LibraryMediaRowProps) {
  return (
    <article className="library-row">
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

      <div>
        <p className="media-meta">
          {media.type === "movie" ? "Movie" : "TV Show"}
        </p>
        <h2 className="library-row__title">
          {media.title}
          {media.releaseYear ? ` (${media.releaseYear})` : ""}
        </h2>
        {detail ? <p className="library-row__detail">{detail}</p> : null}
      </div>
    </article>
  );
}
