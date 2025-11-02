import { NextResponse } from "next/server";
import { getInviteByHash } from "@/lib/invites";
import { logAuditEvent } from "@/lib/logging";

interface RouteContext {
  params: { hash: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const invite = await getInviteByHash(params.hash);

  if (!invite) {
    await logAuditEvent({
      action: "INVITE_INIT",
      targetType: "invites",
      targetId: params.hash,
      outcome: "denied",
      metadata: { reason: "NOT_FOUND" }
    });
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAuditEvent({
    action: "INVITE_INIT",
    targetType: "invites",
    targetId: invite.id,
    outcome: "success",
    metadata: { scopeList: invite.scopeList }
  });

  return NextResponse.json({
    inviteId: invite.id,
    type: invite.type,
    scope: invite.scopeList,
    filters: invite.filterSnapshot,
    expiresAt: invite.expiresAt,
    rawJwt: invite.rawJwt
  });
}
