import { prisma } from "@hr/db";
import { type FastifyInstance } from "fastify";
import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";

const inviteSchema = z.object({
  type: z.enum(["register_invite", "view_invite"]),
  scopes: z.array(z.string()).nonempty(),
  filters: z.array(z.string()).optional(),
  expiresInMinutes: z.number().int().min(5).max(60 * 24 * 14).optional(),
  invitee: z.object({
    userName: z.string().min(3),
    sectors: z.array(z.string()).optional()
  })
});

const inviteInitSchema = z.object({
  inviteId: z.string().uuid()
});

export async function registerInviteRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: app.authenticate }, async (request, reply) => {
    const body = inviteSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const {
      type,
      scopes,
      filters,
      expiresInMinutes,
      invitee: { userName, sectors }
    } = body.data;

    if (!request.user?.sub) {
      return reply.status(403).send({ error: "MISSING_SUBJECT" });
    }

    const now = new Date();
    const expiresAt = expiresInMinutes
      ? new Date(now.getTime() + expiresInMinutes * 60_000)
      : null;

    const invite = await prisma.invite.create({
      data: {
        type,
        createdById: request.user.sub,
        inviteJwtHash: randomUUID(),
        status: "pending",
        scopeList: scopes,
        filterSnapshot: filters ? { filters } : null,
        expiresAt,
        rawJwt: null
      }
    });

    const token = await app.jwt.sign(
      {
        sub: invite.id,
        name: userName,
        scope: scopes,
        "filter-list": filters,
        sectors
      },
      expiresAt ? { expiresIn: `${expiresInMinutes}m` } : {}
    );

    const inviteHash = createHash("sha256").update(token).digest("hex");

    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        rawJwt: token,
        inviteJwtHash: inviteHash
      }
    });

    await prisma.tokenIssued.create({
      data: {
        inviteId: invite.id,
        scopes,
        filterSnapshot: filters ? { filters } : null,
        exp: expiresAt,
        jti: randomUUID()
      }
    });

    return reply.status(201).send({
      inviteId: invite.id,
      inviteJwtHash: inviteHash,
      expiresAt,
      token
    });
  });

  app.post("/init", async (request, reply) => {
    const body = inviteInitSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const invite = await prisma.invite.findUnique({
      where: { id: body.data.inviteId }
    });

    if (!invite) {
      return reply.status(404).send({ error: "INVITE_NOT_FOUND" });
    }

    if (invite.status !== "pending") {
      return reply.status(400).send({ error: "INVITE_ALREADY_USED" });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return reply.status(410).send({ error: "INVITE_EXPIRED" });
    }

    return reply.send({
      inviteId: invite.id,
      token: invite.rawJwt,
      scope: invite.scopeList,
      expiresAt: invite.expiresAt
    });
  });
}
