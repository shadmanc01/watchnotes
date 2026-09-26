import type { FastifyReply } from "fastify";
import type { Session } from "@supabase/supabase-js";

export const ACCESS_TOKEN_COOKIE = "watchnotes_access_token";
export const REFRESH_TOKEN_COOKIE = "watchnotes_refresh_token";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function setAuthCookies(reply: FastifyReply, session: Session) {
  reply.setCookie(
    ACCESS_TOKEN_COOKIE,
    session.access_token,
    cookieOptions(session.expires_in),
  );

  reply.setCookie(
    REFRESH_TOKEN_COOKIE,
    session.refresh_token,
    cookieOptions(60 * 60 * 24 * 30),
  );
}

export function clearAuthCookies(reply: FastifyReply) {
  const options = {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  reply.clearCookie(ACCESS_TOKEN_COOKIE, options);
  reply.clearCookie(REFRESH_TOKEN_COOKIE, options);
}
