import type { FastifyInstance } from "fastify";
import { searchMedia } from "./media.service.js";

type SearchMediaQuery = {
  q?: string;
};

export function registerMediaRoutes(app: FastifyInstance) {
  app.get<{ Querystring: SearchMediaQuery }>(
    "/media/search",
    async (request, reply) => {
      const query = request.query.q?.trim();

      if (!query || query.length < 2) {
        return reply.status(400).send({
          error: "Search query must contain at least 2 characters.",
        });
      }

      const results = await searchMedia(query);

      return {
        query,
        results,
      };
    },
  );
}
