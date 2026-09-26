import Link from "next/link";
import { PageContainer } from "../../../components/layout/PageContainer";

export function HomeScreen() {
  return (
    <PageContainer>
      <section>
        <p>Watchnotes</p>
        <h1>Rank what you watch.</h1>
        <p>
          Build your movie and TV rankings, compare taste with friends, and track
          how much time you have spent watching.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/discover">Search the media catalog</Link>
          <Link href="/signup">Create account</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/account">Account</Link>
        </div>
      </section>
    </PageContainer>
  );
}
