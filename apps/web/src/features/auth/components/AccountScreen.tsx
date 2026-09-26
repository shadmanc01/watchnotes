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
        <h1>You are not signed in.</h1>
        <Link href="/login">Sign in</Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section>
        <p>Account</p>
        <h1>{user.profile?.displayName ?? user.profile?.username ?? "Watchnotes user"}</h1>
        {user.profile ? <p>@{user.profile.username}</p> : null}
        <p>{user.email}</p>

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
