"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "../../../components/layout/PageContainer";
import { logout } from "../api/auth.api";
import { useCurrentSession } from "../hooks/useCurrentSession";

export function AccountScreen() {
  const router = useRouter();
  const { user, isLoading } = useCurrentSession();

  if (isLoading) {
    return <PageContainer>Loading account...</PageContainer>;
  }

  if (!user) {
    return (
      <PageContainer>
        <section className="auth-shell">
          <p className="page-kicker">Account</p>
          <h1 className="page-title">You are not signed in.</h1>
          <div className="inline-links">
            <Link href="/login">Sign in</Link>
          </div>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="account-card">
        <p className="page-kicker">Account</p>
        <h1>
          {user.profile?.displayName ??
            user.profile?.username ??
            "Watchnotes user"}
        </h1>
        {user.profile ? (
          <p className="account-card__meta">@{user.profile.username}</p>
        ) : null}
        <p className="account-card__meta">{user.email}</p>

        {user.profile ? (
          <div className="inline-links">
            <Link href={`/u/${user.profile.username}`}>
              View public profile
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </section>
    </PageContainer>
  );
}
