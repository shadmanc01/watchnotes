import type { MediaSummary } from "@watchnotes/shared";

type MediaCardProps = {
  media: MediaSummary;
};

export function MediaCard({ media }: MediaCardProps) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr",
        gap: 16,
        padding: "16px 0",
        borderBottom: "1px solid #ddd",
      }}
    >
      <div>
        {media.posterUrl ? (
          <img
            src={media.posterUrl}
            alt=""
            width={88}
            style={{ width: 88, height: 132, objectFit: "cover" }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{ width: 88, height: 132, background: "#e8e8e8" }}
          />
        )}
      </div>

      <div>
        <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase" }}>
          {media.type === "movie" ? "Movie" : "TV Show"}
        </p>
        <h2 style={{ margin: "4px 0" }}>
          {media.title}
          {media.releaseYear ? ` (${media.releaseYear})` : ""}
        </h2>
        {media.overview ? <p>{media.overview}</p> : null}
      </div>
    </article>
  );
}
