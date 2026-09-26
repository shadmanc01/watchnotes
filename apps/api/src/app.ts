import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { registerHealthRoutes } from "./modules/health/health.routes.js";
import { registerMediaRoutes } from "./modules/media/media.routes.js";
import { registerProfileRoutes } from "./modules/profiles/profile.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  void app.register(cookie);
  void app.register(cors, {
    credentials: true,
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  });

  registerHealthRoutes(app);
  registerMediaRoutes(app);
  registerAuthRoutes(app);
  registerProfileRoutes(app);

  return app;
}
