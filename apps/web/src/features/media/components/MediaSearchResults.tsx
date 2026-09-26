import type { MediaSummary } from "@watchnotes/shared";
import { MediaCard } from "./MediaCard";

type MediaSearchResultsProps = {
  results: MediaSummary[];
  hasSearched: boolean;
};

export function MediaSearchResults({
  results,
  hasSearched,
}: MediaSearchResultsProps) {
  if (!hasSearched) {
    return null;
  }

  if (results.length === 0) {
    return <p>No matching movies or TV shows found.</p>;
  }

  return (
    <section aria-label="Search results">
      {results.map((media) => (
        <MediaCard key={media.id} media={media} />
      ))}
    </section>
  );
}
