import type { WatchEventSummary } from "@watchnotes/shared";
import styles from "./TitleDetail.module.css";

type WatchHistoryProps = {
  events: WatchEventSummary[];
};

export function WatchHistory({ events }: WatchHistoryProps) {
  return (
    <section className={styles.historyCard}>
      <p className="page-kicker">History</p>
      <h2>Watch history</h2>

      {events.length === 0 ? (
        <p className={styles.muted}>You have not watched this title yet.</p>
      ) : (
        <ol className={styles.historyList}>
          {events.map((event, index) => (
            <li key={`${event.watchedAt}-${index}`}>
              <div>
                <strong>
                  {event.isRewatch ? "Rewatch" : index === events.length - 1 ? "First watch" : "Watch"}
                </strong>
                <p>{new Date(event.watchedAt).toLocaleString()}</p>
              </div>
              {event.runtimeMinutes ? (
                <span>{event.runtimeMinutes} min</span>
              ) : (
                <span>Runtime untracked</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
