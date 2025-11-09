import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInviteToken } from "@/lib/auth";
import { hasScope, scopeIntersects } from "@/lib/scopes";
import { logAuditEvent } from "@/lib/logging";
import { createApplicationViewedNotification } from "@/lib/notifications";
import { serializeApplication } from "@/lib/serializers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "TOKEN_REQUIRED" }, { status: 400 });
  }

  let payload;
  try {
    payload = await verifyInviteToken(token);
  } catch (error) {
    await logAuditEvent({
      action: "APPLICATION_VIEW",
      targetType: "applications",
      targetId: id,
      outcome: "error",
      metadata: { reason: "TOKEN_INVALID", error: String(error) }
    });
    return NextResponse.json({ error: "TOKEN_INVALID" }, { status: 401 });
  }

  const scopes = Array.isArray(payload.scope)
    ? (payload.scope as string[])
    : typeof payload.scope === "string"
      ? [(payload.scope as string)]
      : [];

  if (!hasScope(scopes, "view-invite")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const filterList = Array.isArray(payload["filter-list"])
    ? (payload["filter-list"] as string[])
    : [];

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      personalInfo: true,
      documents: true,
      sectors: { include: { sector: true } },
      owner: true
    }
  });

  if (!application) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const tokenSnapshot = application.tokenFilterSnapshot as
    | { filters?: string[] }
    | null;
  const applicationFilterSnapshot = tokenSnapshot?.filters ?? [];

  if (applicationFilterSnapshot.length > 0 && filterList.length === 0) {
    await logAuditEvent({
      action: "APPLICATION_VIEW",
      targetType: "applications",
      targetId: application.id,
      outcome: "denied",
      metadata: { reason: "MISSING_FILTER_SCOPE" },
      actorUserId: payload.sub ?? null
    });
    return NextResponse.json({ error: "MISSING_FILTER_SCOPE" }, { status: 403 });
  }

  const review = await prisma.review.create({
    data: {
      applicationId: application.id,
      reviewerUserId: payload.sub ?? null,
      inviteId: null,
      visibilityMatched: true,
      reviewerFilterSnapshot: filterList.length ? { filters: filterList } : undefined,
      createdAt: new Date()
    }
  });

  await logAuditEvent({
    action: "APPLICATION_VIEW",
    targetType: "applications",
    targetId: application.id,
    outcome: "success",
    metadata: { reviewId: review.id },
    tokenScopeSnapshot: scopes,
    tokenFilterSnapshot: filterList.length ? { filters: filterList } : undefined,
    actorUserId: payload.sub ?? null
  });

  const registerToken = await prisma.tokenIssued.findFirst({
    where: {
      subjectUserId: application.userId,
      scopes: { has: "register-invite" }
    },
    orderBy: { createdAt: "desc" }
  });

  if (registerToken) {
    await createApplicationViewedNotification({
      applicationId: application.id,
      reviewerUserId: payload.sub ?? null,
      ownerId: application.userId
    });
  }

  return NextResponse.json(serializeApplication(application));
}
