import type { LibraryMediaReference, MediaType } from "@watchnotes/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getRequestAuth } from "../auth/auth.request.js";
import {
  getWatched,
  getWatchlist,
  markAsWatched,
  saveToWatchlist,
} from "./library.service.js";

type LibraryBody = {
  providerId?: number;
  type?: MediaType;
};

function getMediaReference(body: LibraryBody): LibraryMediaReference | null {
  if (
    !Number.isInteger(body.providerId) ||
    (body.type !== "movie" && body.type !== "tv")
  ) {
    return null;
  }

  return {
    providerId: body.providerId as number,
    type: body.type,
  };
}

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const auth = await getRequestAuth(request, reply);

  if (!auth) {
    reply.status(401).send({
      error: "Sign in to manage your Watchnotes library.",
    });
    return null;
  }

  return auth;
}

export function registerLibraryRoutes(app: FastifyInstance) {
  app.get("/library/watchlist", async (request, reply) => {
    const auth = await requireAuth(request, reply);

    if (!auth) {
      return;
    }

    const items = await getWatchlist(auth.accessToken, auth.user.id);
    return { items };
  });

  app.get("/library/watched", async (request, reply) => {
    const auth = await requireAuth(request, reply);

    if (!auth) {
      return;
    }

    const items = await getWatched(auth.accessToken, auth.user.id);
    return { items };
  });

  app.post<{ Body: LibraryBody }>("/library/watchlist", async (request, reply) => {
    const auth = await requireAuth(request, reply);

    if (!auth) {
      return;
    }

    const mediaReference = getMediaReference(request.body);

    if (!mediaReference) {
      return reply.status(400).send({
        error: "A valid media type and provider ID are required.",
      });
    }

    const media = await saveToWatchlist(
      auth.accessToken,
      auth.user.id,
      mediaReference,
    );

    return reply.status(201).send({ media });
  });

  app.post<{ Body: LibraryBody }>("/library/watched", async (request, reply) => {
    const auth = await requireAuth(request, reply);

    if (!auth) {
      return;
    }

    const mediaReference = getMediaReference(request.body);

    if (!mediaReference) {
      return reply.status(400).send({
        error: "A valid media type and provider ID are required.",
      });
    }

    const result = await markAsWatched(
      auth.accessToken,
      auth.user.id,
      mediaReference,
    );

    return reply.status(201).send(result);
  });
}
