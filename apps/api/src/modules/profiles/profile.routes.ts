import type { FastifyInstance } from "fastify";
import { getProfileByUsername } from "./profile.service.js";

type ProfileParams = {
  username: string;
};

export function registerProfileRoutes(app: FastifyInstance) {
  app.get<{ Params: ProfileParams }>("/profiles/:username", async (request, reply) => {
    const profile = await getProfileByUsername(request.params.username);

    if (!profile) {
      return reply.status(404).send({
        error: "Profile not found.",
      });
    }

    return { profile };
  });
}
