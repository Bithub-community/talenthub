import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import jwtPlugin from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { registerInviteRoutes } from "./routes/invites";
import { registerDiagnosticsRoutes } from "./routes/diagnostics";

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty"
          }
        : undefined
  }
});

await fastify.register(rateLimit, {
  max: 50,
  timeWindow: "1 minute"
});

const privateKey = process.env.AUTH_PRIVATE_KEY?.replace(/\\n/g, "\n");
const publicKey = process.env.AUTH_PUBLIC_KEY?.replace(/\\n/g, "\n");

if (!privateKey || !publicKey) {
  fastify.log.error("Missing AUTH_PRIVATE_KEY or AUTH_PUBLIC_KEY");
  process.exit(1);
}

await fastify.register(jwtPlugin, {
  secret: {
    private: privateKey,
    public: publicKey
  },
  sign: {
    algorithm: "RS256",
    expiresIn: "15m"
  }
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
  interface FastifyRequest {
    user: {
      sub?: string;
      scope?: string[];
    };
  }
}

fastify.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      request.log.warn({ err }, "JWT verification failed");
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }
  }
);

await fastify.register(registerDiagnosticsRoutes, { prefix: "/health" });
await fastify.register(registerInviteRoutes, { prefix: "/invites" });

const port = Number.parseInt(process.env.PORT ?? "4000", 10);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await fastify.listen({ port, host });
  fastify.log.info(`Auth service listening on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
