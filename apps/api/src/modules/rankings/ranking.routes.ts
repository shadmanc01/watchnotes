import type { MediaType } from "@watchnotes/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getRequestAuth } from "../auth/auth.request.js";
import {
  answerRankingComparison,
  getActiveRanking,
  getRanking,
  getUnrankedWatched,
  startRanking,
} from "./ranking.service.js";

type RankingParams = {
  type: string;
};

type SessionParams = RankingParams & {
  sessionId: string;
};

type StartBody = {
  mediaId?: string;
};

type AnswerBody = {
  preferredMediaId?: string;
};

function parseMediaType(value: string): MediaType | null {
  if (value === "movie" || value === "tv") {
    return value;
  }

  return null;
}

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const auth = await getRequestAuth(request, reply);

  if (!auth) {
    reply.status(401).send({
      error: "Sign in to manage your rankings.",
    });
    return null;
  }

  return auth;
}

function sendRankingError(
  request: FastifyRequest,
  reply: FastifyReply,
  error: unknown,
) {
  request.log.warn(error);

  return reply.status(400).send({
    error: error instanceof Error ? error.message : "Unable to update ranking.",
  });
}

export function registerRankingRoutes(app: FastifyInstance) {
  app.get<{ Params: RankingParams }>("/rankings/:type", async (request, reply) => {
    const auth = await requireAuth(request, reply);

    if (!auth) {
      return;
    }

    const mediaType = parseMediaType(request.params.type);

    if (!mediaType) {
      return reply.status(400).send({ error: "Unknown ranking type." });
    }

    const entries = await getRanking(auth.accessToken, auth.user.id, mediaType);
    return { entries };
  });

  app.get<{ Params: RankingParams }>(
    "/rankings/:type/unranked",
    async (request, reply) => {
      const auth = await requireAuth(request, reply);

      if (!auth) {
        return;
      }

      const mediaType = parseMediaType(request.params.type);

      if (!mediaType) {
        return reply.status(400).send({ error: "Unknown ranking type." });
      }

      const items = await getUnrankedWatched(
        auth.accessToken,
        auth.user.id,
        mediaType,
      );

      return { items };
    },
  );

  app.get<{ Params: RankingParams }>(
    "/rankings/:type/session",
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
        const session = await getActiveRanking(
          auth.accessToken,
          auth.user.id,
          mediaType,
        );

        return { session };
      } catch (error) {
        return sendRankingError(request, reply, error);
      }
    },
  );

  app.post<{ Params: RankingParams; Body: StartBody }>(
    "/rankings/:type/start",
    async (request, reply) => {
      const auth = await requireAuth(request, reply);

      if (!auth) {
        return;
      }

      const mediaType = parseMediaType(request.params.type);

      if (!mediaType) {
        return reply.status(400).send({ error: "Unknown ranking type." });
      }

      if (!request.body.mediaId) {
        return reply.status(400).send({ error: "A media ID is required." });
      }

      try {
        const session = await startRanking(
          auth.accessToken,
          auth.user.id,
          mediaType,
          request.body.mediaId,
        );

        return { session };
      } catch (error) {
        return sendRankingError(request, reply, error);
      }
    },
  );

  app.post<{ Params: SessionParams; Body: AnswerBody }>(
    "/rankings/:type/sessions/:sessionId/answer",
    async (request, reply) => {
      const auth = await requireAuth(request, reply);

      if (!auth) {
        return;
      }

      const mediaType = parseMediaType(request.params.type);

      if (!mediaType) {
        return reply.status(400).send({ error: "Unknown ranking type." });
      }

      if (!request.body.preferredMediaId) {
        return reply.status(400).send({
          error: "Choose the title you preferred.",
        });
      }

      try {
        const session = await answerRankingComparison(
          auth.accessToken,
          auth.user.id,
          mediaType,
          request.params.sessionId,
          request.body.preferredMediaId,
        );

        return { session };
      } catch (error) {
        return sendRankingError(request, reply, error);
      }
    },
  );
}
