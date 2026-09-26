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
    <div
      style={{
        display: "grid",
        gap: 10,
        justifyItems: "center",
        textAlign: "center",
      }}
    >
      {media.posterUrl ? (
        <img
          src={media.posterUrl}
          alt=""
          width={180}
          style={{
            width: 180,
            height: 270,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: 180,
            height: 270,
            background: "#e8e8e8",
            borderRadius: 8,
          }}
        />
      )}

      <div>
        {eyebrow ? (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 style={{ margin: "4px 0" }}>{media.title}</h2>
        {media.releaseYear ? <p style={{ margin: 0 }}>{media.releaseYear}</p> : null}
      </div>
    </div>
  );
}
