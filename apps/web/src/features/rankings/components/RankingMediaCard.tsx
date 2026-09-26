import type { MediaSummary } from "@watchnotes/shared";

type RankingMediaCardProps = {
  media: MediaSummary;
  eyebrow?: string;
};

export function RankingMediaCard({
  media,
  eyebrow,
}: RankingMediaCardProps) {
  return (
    <div className="ranking-media-card">
      {media.posterUrl ? (
        <img
          className="ranking-media-card__poster"
          src={media.posterUrl}
          alt=""
          width={180}
        />
      ) : (
        <div
          className="ranking-media-card__poster poster-placeholder"
          aria-hidden="true"
        />
      )}

      <div>
        {eyebrow ? <p className="media-meta">{eyebrow}</p> : null}
        <h2>{media.title}</h2>
        {media.releaseYear ? <p>{media.releaseYear}</p> : null}
      </div>
    </div>
  );
}
