import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerHealthRoutes } from "./modules/health/health.routes.js";
import { registerMediaRoutes } from "./modules/media/media.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  void app.register(cors, {
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  });

  registerHealthRoutes(app);
  registerMediaRoutes(app);

  return app;
}
