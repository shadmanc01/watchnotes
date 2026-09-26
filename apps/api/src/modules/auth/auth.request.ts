import type { User } from "@supabase/supabase-js";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "./auth.cookies.js";
import {
  getUserFromAccessToken,
  refreshUserSession,
} from "./auth.service.js";

export type RequestAuth = {
  user: User;
  accessToken: string;
};

export async function getRequestAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<RequestAuth | null> {
  const accessToken = request.cookies[ACCESS_TOKEN_COOKIE];

  if (accessToken) {
    const user = await getUserFromAccessToken(accessToken);

    if (user) {
      return {
        user,
        accessToken,
      };
    }
  }

  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];

  if (refreshToken) {
    const refreshed = await refreshUserSession(refreshToken);

    if (refreshed) {
      setAuthCookies(reply, refreshed.session);

      return {
        user: refreshed.user,
        accessToken: refreshed.session.access_token,
      };
    }
  }

  clearAuthCookies(reply);
  return null;
}
