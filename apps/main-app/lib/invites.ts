import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/logging";
import { slugify } from "@/lib/string";
import { Prisma } from "@hr/db";

export async function getInviteByHash(hash: string) {
  const invite = await prisma.invite.findUnique({
    where: { inviteJwtHash: hash }
  });

  if (!invite) {
    await logAuditEvent({
      action: "INVITE_LOOKUP",
      targetType: "invites",
      targetId: hash,
      outcome: "denied",
      metadata: { reason: "NOT_FOUND" }
    });
    return null;
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "expired" }
    });
    await logAuditEvent({
      action: "INVITE_LOOKUP",
      targetType: "invites",
      targetId: invite.id,
      outcome: "denied",
      metadata: { reason: "EXPIRED" }
    });
    return null;
  }

  return invite;
}

export async function createInvite(params: {
  type: "register_invite" | "view_invite";
  scopes: string[];
  filters?: string[];
  createdById: string;
  expiresAt?: Date | null;
  inviteeName: string;
}) {
  const invite = await prisma.invite.create({
    data: {
      type: params.type,
      createdById: params.createdById,
      inviteJwtHash: slugify(crypto.randomUUID()),
      status: "pending",
      scopeList: params.scopes,
      filterSnapshot: params.filters ? { filters: params.filters } : Prisma.JsonNull,
      expiresAt: params.expiresAt ?? null
    }
  });

  await logAuditEvent({
    action: "INVITE_CREATE",
    targetType: "invites",
    targetId: invite.id,
    outcome: "success",
    metadata: {
      type: invite.type,
      scopes: invite.scopeList,
      filters: params.filters,
      inviteeName: params.inviteeName
    }
  });

  return invite;
}
