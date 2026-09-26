import type { FastifyInstance } from "fastify";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "./auth.cookies.js";
import {
  getUserFromAccessToken,
  refreshUserSession,
  signInUser,
  signUpUser,
} from "./auth.service.js";
import { getProfileById } from "../profiles/profile.service.js";

type SignUpBody = {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

function validateEmail(email: string) {
  return email.includes("@") && email.length <= 254;
}

export function registerAuthRoutes(app: FastifyInstance) {
  app.post<{ Body: SignUpBody }>("/auth/signup", async (request, reply) => {
    const email = request.body.email?.trim() ?? "";
    const password = request.body.password ?? "";
    const username = request.body.username?.trim().toLowerCase() ?? "";

    if (!validateEmail(email)) {
      return reply.status(400).send({ error: "Enter a valid email address." });
    }

    if (password.length < 8) {
      return reply.status(400).send({
        error: "Password must be at least 8 characters.",
      });
    }

    if (!USERNAME_PATTERN.test(username)) {
      return reply.status(400).send({
        error: "Username must be 3-24 characters using lowercase letters, numbers, or underscores.",
      });
    }

    try {
      const result = await signUpUser({
        email,
        password,
        username,
        displayName: request.body.displayName,
      });

      if (result.session) {
        setAuthCookies(reply, result.session);
      }

      return reply.status(201).send({
        user: {
          id: result.user.id,
          email: result.user.email ?? null,
        },
        requiresEmailConfirmation: !result.session,
      });
    } catch (error) {
      request.log.warn(error);
      return reply.status(400).send({
        error: error instanceof Error ? error.message : "Unable to create account.",
      });
    }
  });

  app.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    const email = request.body.email?.trim() ?? "";
    const password = request.body.password ?? "";

    if (!email || !password) {
      return reply.status(400).send({
        error: "Email and password are required.",
      });
    }

    try {
      const result = await signInUser(email, password);
      setAuthCookies(reply, result.session);

      return {
        user: {
          id: result.user.id,
          email: result.user.email ?? null,
        },
      };
    } catch (error) {
      request.log.warn(error);
      return reply.status(401).send({
        error: error instanceof Error ? error.message : "Unable to sign in.",
      });
    }
  });

  app.get("/auth/session", async (request, reply) => {
    const accessToken = request.cookies[ACCESS_TOKEN_COOKIE];
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];

    let user = accessToken ? await getUserFromAccessToken(accessToken) : null;

    if (!user && refreshToken) {
      const refreshed = await refreshUserSession(refreshToken);

      if (refreshed) {
        user = refreshed.user;
        setAuthCookies(reply, refreshed.session);
      }
    }

    if (!user) {
      clearAuthCookies(reply);
      return reply.status(401).send({
        error: "Not signed in.",
      });
    }

    const profile = await getProfileById(user.id);

    return {
      user: {
        id: user.id,
        email: user.email ?? null,
        profile,
      },
    };
  });

  app.post("/auth/logout", async (_request, reply) => {
    clearAuthCookies(reply);

    return {
      success: true,
    };
  });
}
