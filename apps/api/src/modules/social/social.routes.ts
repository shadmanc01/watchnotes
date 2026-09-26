import type { MediaType } from "@watchnotes/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getRequestAuth } from "../auth/auth.request.js";
import {
  followProfile,
  getPublicProfileRanking,
  getSocialProfile,
  getSocialViewerState,
  getTasteMatch,
  saveFromProfileRanking,
  unfollowProfile,
} from "./social.service.js";

type UsernameParams = {
  username: string;
};

type RankingParams = UsernameParams & {
  type: string;
};

type SaveParams = RankingParams & {
  mediaId: string;
};

function parseMediaType(value: string): MediaType | null {
  if (value === "movie" || value === "tv") {
    return value;
  }

  return null;
}

function sendSocialError(
  request: FastifyRequest,
  reply: FastifyReply,
  error: unknown,
) {
  request.log.warn(error);
  const message =
    error instanceof Error ? error.message : "Unable to update social profile.";

  return reply.status(message === "Profile not found." ? 404 : 400).send({
    error: message,
  });
}

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const auth = await getRequestAuth(request, reply);

  if (!auth) {
    reply.status(401).send({
      error: "Sign in to use social features.",
    });
    return null;
  }

  return auth;
}

export function registerSocialRoutes(app: FastifyInstance) {
  app.get<{ Params: UsernameParams }>(
    "/social/profiles/:username",
    async (request, reply) => {
      try {
        const socialProfile = await getSocialProfile(request.params.username);
        return { socialProfile };
      } catch (error) {
        return sendSocialError(request, reply, error);
      }
    },
  );

  app.get<{ Params: UsernameParams }>(
    "/social/profiles/:username/viewer",
    async (request, reply) => {
      try {
        const auth = await getRequestAuth(request, reply);
        const viewer = await getSocialViewerState(
          auth?.accessToken ?? null,
          auth?.user.id ?? null,
          request.params.username,
        );

        return { viewer };
      } catch (error) {
        return sendSocialError(request, reply, error);
      }
    },
  );

  app.get<{ Params: RankingParams }>(
    "/social/profiles/:username/rankings/:type",
    async (request, reply) => {
      const mediaType = parseMediaType(request.params.type);

      if (!mediaType) {
        return reply.status(400).send({ error: "Unknown ranking type." });
      }

      try {
        const entries = await getPublicProfileRanking(
          request.params.username,
          mediaType,
        );

        return { entries };
      } catch (error) {
        return sendSocialError(request, reply, error);
      }
    },
  );

  app.get<{ Params: RankingParams }>(
    "/social/profiles/:username/taste-match/:type",
    async (request, reply) => {
      const auth = await requireAuth(request, reply);

      if (!auth) {
        return;
      }

      const mediaType = parseMediaType(request.params.type);

      if (!mediaType) {
        return reply.status(400).send({ error: "Unknown ranking type." });
      }

      try {
        const tasteMatch = await getTasteMatch(
          auth.user.id,
          request.params.username,
          mediaType,
        );

        return { tasteMatch };
      } catch (error) {
        return sendSocialError(request, reply, error);
      }
    },
  );

  app.post<{ Params: UsernameParams }>(
    "/social/profiles/:username/follow",
    async (request, reply) => {
      const auth = await requireAuth(request, reply);

      if (!auth) {
        return;
      }

      try {
        await followProfile(
          auth.accessToken,
          auth.user.id,
          request.params.username,
        );

        return { success: true };
      } catch (error) {
        return sendSocialError(request, reply, error);
      }
    },
  );

  app.delete<{ Params: UsernameParams }>(
    "/social/profiles/:username/follow",
    async (request, reply) => {
      const auth = await requireAuth(request, reply);

      if (!auth) {
        return;
      }

      try {
        await unfollowProfile(
          auth.accessToken,
          auth.user.id,
          request.params.username,
        );

        return { success: true };
      } catch (error) {
        return sendSocialError(request, reply, error);
      }
    },
  );

  app.post<{ Params: SaveParams }>(
    "/social/profiles/:username/rankings/:type/:mediaId/save",
    async (request, reply) => {
      const auth = await requireAuth(request, reply);

      if (!auth) {
        return;
      }

      const mediaType = parseMediaType(request.params.type);

      if (!mediaType) {
        return reply.status(400).send({ error: "Unknown ranking type." });
      }

      try {
        await saveFromProfileRanking(
          auth.accessToken,
          auth.user.id,
          request.params.username,
          mediaType,
          request.params.mediaId,
        );

        return { success: true };
      } catch (error) {
        return sendSocialError(request, reply, error);
      }
    },
  );
}
