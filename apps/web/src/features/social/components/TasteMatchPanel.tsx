import type {
  SocialViewerState,
  TasteMatchResult,
  TasteMatchTitle,
} from "@watchnotes/shared";
import Link from "next/link";
import styles from "./PublicProfile.module.css";

type TasteMatchPanelProps = {
  username: string;
  viewer: SocialViewerState;
  tasteMatch: TasteMatchResult | null;
  isLoading: boolean;
};

function MatchTitleRow({
  item,
  username,
}: {
  item: TasteMatchTitle;
  username: string;
}) {
  return (
    <li className={styles.matchTitle}>
      <div>
        <strong>{item.media.title}</strong>
        <span>
          You #{item.yourPosition} · @{username} #{item.theirPosition}
        </span>
      </div>
      <small>{item.percentileGap}% rank gap</small>
    </li>
  );
}

export function TasteMatchPanel({
  username,
  viewer,
  tasteMatch,
  isLoading,
}: TasteMatchPanelProps) {
  if (viewer.isSelf) {
    return null;
  }

  return (
    <section className={styles.tasteSection}>
      <div className={styles.tasteHeading}>
        <div>
          <p className="page-kicker">Taste Match</p>
          <h2>How your rankings line up</h2>
        </div>
      </div>

      {!viewer.authenticated ? (
        <div className={styles.tasteEmpty}>
          <p>Sign in to compare your ranked titles with @{username}.</p>
          <Link className="cta-link" href="/login">
            Sign in
          </Link>
        </div>
      ) : isLoading ? (
        <p>Comparing rankings...</p>
      ) : tasteMatch ? (
        <>
          <div className={styles.tasteSummary}>
            <div className={styles.scoreCard}>
              <span>Match</span>
              <strong>
                {tasteMatch.score === null ? "—" : `${tasteMatch.score}%`}
              </strong>
              <small>
                {tasteMatch.score === null
                  ? `Rank at least ${tasteMatch.minimumSharedCount} of the same titles`
                  : `${tasteMatch.pairComparisons} shared preference comparisons`}
              </small>
            </div>

            <div className={styles.tasteStats}>
              <article>
                <span>Shared</span>
                <strong>{tasteMatch.sharedCount}</strong>
              </article>
              <article>
                <span>Your ranking</span>
                <strong>{tasteMatch.yourRankedCount}</strong>
              </article>
              <article>
                <span>@{username}</span>
                <strong>{tasteMatch.theirRankedCount}</strong>
              </article>
            </div>
          </div>

          {tasteMatch.sharedCount > 0 ? (
            <div className={styles.tasteLists}>
              <section>
                <h3>Closest agreements</h3>
                <ol>
                  {tasteMatch.agreements.map((item) => (
                    <MatchTitleRow
                      key={`agreement-${item.media.id}`}
                      item={item}
                      username={username}
                    />
                  ))}
                </ol>
              </section>

              <section>
                <h3>Biggest disagreements</h3>
                <ol>
                  {tasteMatch.disagreements.map((item) => (
                    <MatchTitleRow
                      key={`disagreement-${item.media.id}`}
                      item={item}
                      username={username}
                    />
                  ))}
                </ol>
              </section>
            </div>
          ) : (
            <p className={styles.helperText}>
              You do not have any shared ranked titles in this category yet.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}
