import { type FastifyInstance } from "fastify";

export async function registerDiagnosticsRoutes(app: FastifyInstance) {
  app.get("/", async () => ({
    status: "ok",
    service: "auth-service",
    uptime: process.uptime()
  }));
}
