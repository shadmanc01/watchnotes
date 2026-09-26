import type { CurrentUser } from "@watchnotes/shared";

type ApiError = {
  error?: string;
};

type SignUpInput = {
  email: string;
  password: string;
  username: string;
  displayName?: string;
};

type SignUpResponse = {
  user: {
    id: string;
    email: string | null;
  };
  requiresEmailConfirmation: boolean;
};

function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return new URL(path, baseUrl);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiError
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload && payload.error
        ? payload.error
        : "Something went wrong.";

    throw new Error(message);
  }

  return payload as T;
}

export function signUp(input: SignUpInput) {
  return request<SignUpResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(email: string, password: string) {
  return request<{ user: { id: string; email: string | null } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getSession() {
  return request<{ user: CurrentUser }>("/auth/session");
}

export function logout() {
  return request<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
}
