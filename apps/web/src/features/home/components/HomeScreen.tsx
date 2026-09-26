import Link from "next/link";
import { PageContainer } from "../../../components/layout/PageContainer";

export function HomeScreen() {
  return (
    <PageContainer>
      <section className="hero">
        <p className="hero__eyebrow">Your taste, not a star rating</p>
        <h1 className="hero__title">Rank what you watch.</h1>
        <p className="hero__copy">
          Build a living ranking of your movies and TV shows through simple
          head-to-head choices, then use it to discover what to watch next.
        </p>

        <div className="hero__actions">
          <Link className="cta-link" href="/rank">
            Start ranking
          </Link>
          <Link className="cta-link cta-link--secondary" href="/discover">
            Discover titles
          </Link>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <h2>Head-to-head ranking</h2>
            <p>
              Skip arbitrary star ratings. Choose what you preferred and let
              Watchnotes place every title in order.
            </p>
          </article>

          <article className="feature-card">
            <h2>Your watch history</h2>
            <p>
              Track what you watched, rewatches, movie runtime, and a watchlist
              for everything you want to get to next.
            </p>
          </article>

          <article className="feature-card">
            <h2>Built for shared taste</h2>
            <p>
              Rankings become the foundation for future friend comparisons,
              taste matches, and recommendations.
            </p>
          </article>
        </div>
      </section>
    </PageContainer>
  );
}
