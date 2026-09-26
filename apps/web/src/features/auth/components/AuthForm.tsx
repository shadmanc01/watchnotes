"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, signUp } from "../api/auth.api";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignup) {
        const result = await signUp({
          email,
          password,
          username: username.toLowerCase(),
          displayName: displayName || undefined,
        });

        if (result.requiresEmailConfirmation) {
          setMessage("Account created. Check your email to confirm your account.");
          return;
        }
      } else {
        await login(email, password);
      }

      router.push("/account");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 420 }}>
      {isSignup ? (
        <>
          <label>
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
            />
          </label>
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={24}
              required
            />
          </label>
        </>
      ) : null}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Working..." : isSignup ? "Create account" : "Sign in"}
      </button>

      {message ? <p role="status">{message}</p> : null}

      <p>
        {isSignup ? "Already have an account? " : "New to Watchnotes? "}
        <Link href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
