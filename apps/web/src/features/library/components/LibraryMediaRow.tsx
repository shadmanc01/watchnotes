import type { MediaSummary } from "@watchnotes/shared";

type LibraryMediaRowProps = {
  media: MediaSummary;
  detail?: string;
};

export function LibraryMediaRow({ media, detail }: LibraryMediaRowProps) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        gap: 14,
        padding: "14px 0",
        borderBottom: "1px solid #ddd",
      }}
    >
      {media.posterUrl ? (
        <img
          src={media.posterUrl}
          alt=""
          width={72}
          style={{ width: 72, height: 108, objectFit: "cover" }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{ width: 72, height: 108, background: "#e8e8e8" }}
        />
      )}

      <div>
        <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase" }}>
          {media.type === "movie" ? "Movie" : "TV Show"}
        </p>
        <h2 style={{ margin: "4px 0" }}>
          {media.title}
          {media.releaseYear ? ` (${media.releaseYear})` : ""}
        </h2>
        {detail ? <p>{detail}</p> : null}
      </div>
    </article>
  );
}
