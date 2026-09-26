import type { MediaSummary } from "@watchnotes/shared";
import { MediaActions } from "../../library/components/MediaActions";

type MediaCardProps = {
  media: MediaSummary;
};

export function MediaCard({ media }: MediaCardProps) {
  return (
    <article className="media-card">
      <div>
        {media.posterUrl ? (
          <img
            className="media-card__poster"
            src={media.posterUrl}
            alt=""
            width={96}
          />
        ) : (
          <div
            className="media-card__poster poster-placeholder"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="media-card__body">
        <div>
          <p className="media-meta">
            {media.type === "movie" ? "Movie" : "TV Show"}
          </p>
          <h2 className="media-title">
            {media.title}
            {media.releaseYear ? ` (${media.releaseYear})` : ""}
          </h2>
          {media.overview ? (
            <p className="media-description">{media.overview}</p>
          ) : null}
        </div>

        <MediaActions media={media} />
      </div>
    </article>
  );
}
