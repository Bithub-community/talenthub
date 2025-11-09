import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { type AuditOutcome } from "@hr/db";

interface AuditEvent {
  action: string;
  targetType: string;
  targetId?: string | null;
  outcome: AuditOutcome;
  metadata?: any;
  tokenScopeSnapshot?: string[] | null;
  tokenFilterSnapshot?: any;
  actorUserId?: string | null;
}

export async function logAuditEvent(event: AuditEvent) {
  const hdrs = await headers();
  const actorIp = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip");
  const actorUserAgent = hdrs.get("user-agent");

  await prisma.auditLog.create({
    data: {
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId ?? null,
      outcome: event.outcome,
      metadata: event.metadata ?? null,
      tokenScopeSnapshot: event.tokenScopeSnapshot ?? undefined,
      tokenFilterSnapshot: event.tokenFilterSnapshot ?? null,
      actorUserId: event.actorUserId ?? null,
      actorIp,
      actorUserAgent,
      createdAt: new Date()
    }
  });
}