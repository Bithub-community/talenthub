import { NextRequest, NextResponse } from "next/server";
import { getInviteByHash } from "@/lib/invites";
import { logAuditEvent } from "@/lib/logging";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  const invite = await getInviteByHash(hash);

  if (!invite) {
    await logAuditEvent({
      action: "INVITE_INIT",
      targetType: "invites",
      targetId: hash,
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
