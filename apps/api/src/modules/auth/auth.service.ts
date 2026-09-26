import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseClient } from "../../integrations/supabase/supabase.client.js";

type SignUpInput = {
  email: string;
  password: string;
  username: string;
  displayName?: string;
};

type AuthResult = {
  user: User;
  session: Session | null;
};

export async function signUpUser(input: SignUpInput): Promise<AuthResult> {
  const supabase = createSupabaseClient();
  const username = input.username.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        username,
        display_name: input.displayName?.trim() || username,
      },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Unable to create account.");
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function signInUser(email: string, password: string): Promise<AuthResult> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message ?? "Unable to sign in.");
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function getUserFromAccessToken(accessToken: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function refreshUserSession(refreshToken: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.user || !data.session) {
    return null;
  }

  return {
    user: data.user,
    session: data.session,
  };
}
