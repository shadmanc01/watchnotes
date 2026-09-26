import Link from "next/link";
import { PageContainer } from "../../../components/layout/PageContainer";

export function HomeScreen() {
  return (
    <PageContainer>
      <section>
        <p>Watchnotes</p>
        <h1>Rank what you watch.</h1>
        <p>
          Head-to-head movie and TV rankings, social discovery, watchlists, and
          viewing stats are coming next.
        </p>
        <Link href="/discover">Search the media catalog</Link>
      </section>
    </PageContainer>
  );
}
