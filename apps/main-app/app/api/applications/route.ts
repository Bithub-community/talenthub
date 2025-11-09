import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInviteToken } from "@/lib/auth";
import { logAuditEvent } from "@/lib/logging";
import { hasScope, scopeIntersects } from "@/lib/scopes";
import { slugify } from "@/lib/string";
import { serializeApplication } from "@/lib/serializers";
import { z } from "zod";
import { randomUUID } from "crypto";

const documentSchema = z.object({
  docType: z.enum(["cv", "motivation_letter", "attachment"]),
  fileName: z.string(),
  storageUrl: z.string().url(),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  hashSha256: z.string().optional()
});

const personalInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  dob: z.string().optional(),
  nationality: z.string().optional()
});

const applicationPayloadSchema = z.object({
  token: z.string(),
  status: z
    .enum([
      "draft",
      "submitted",
      "under_review",
      "accepted",
      "rejected",
      "withdrawn"
    ])
    .default("submitted"),
  primaryLocation: z.string().optional(),
  primarySectorId: z.number().optional(),
  sectors: z.array(z.number()).optional(),
  personalInfo: personalInfoSchema,
  documents: z.array(documentSchema).optional()
});

export async function POST(request: Request) {
  const json = await request.json();
  const body = applicationPayloadSchema.safeParse(json);

  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { token, status, primaryLocation, primarySectorId, sectors, personalInfo, documents } =
    body.data;

  let payload;
  try {
    payload = await verifyInviteToken(token);
  } catch (error) {
    await logAuditEvent({
      action: "APPLICATION_CREATE",
      targetType: "applications",
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

  if (!hasScope(scopes, "register-invite")) {
    await logAuditEvent({
      action: "APPLICATION_CREATE",
      targetType: "applications",
      outcome: "denied",
      metadata: { reason: "INSUFFICIENT_SCOPE", scopes }
    });
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const filterList = Array.isArray(payload["filter-list"])
    ? (payload["filter-list"] as string[])
    : [];

  if (sectors && !scopeIntersects(filterList, sectors.map(String))) {
    return NextResponse.json({ error: "SCOPE_FILTER_MISMATCH" }, { status: 403 });
  }

  const userId = payload.sub ? String(payload.sub) : randomUUID();

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      userName: payload.name ? slugify(String(payload.name)) : undefined
    },
    create: {
      id: userId,
      userName:
        payload.name?.toString().replace(/\s+/g, "-") ?? `candidate-${userId.slice(0, 8)}`,
      role: "authorized_user",
      status: "active"
    }
  });
  const created = await prisma.application.create({
    data: {
      userId,
      status,
      primaryLocation: primaryLocation ?? null,
      primarySectorId: primarySectorId ?? null,
      tokenFilterSnapshot: filterList.length ? { filters: filterList } : undefined,
      submittedAt: status === "submitted" ? new Date() : null,
      personalInfo: {
        create: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone ?? null,
          location: personalInfo.location ?? null,
          dob: personalInfo.dob ? new Date(personalInfo.dob) : null,
          nationality: personalInfo.nationality ?? null,
          updatedAt: new Date()
        }
      },
      sectors: sectors?.length
        ? {
          create: sectors.map((sectorId) => ({ sectorId }))
        }
        : undefined,
      documents: documents?.length
        ? {
          create: documents.map((doc) => ({
            docType: doc.docType,
            fileName: doc.fileName,
            storageUrl: doc.storageUrl,
            mimeType: doc.mimeType,
            sizeBytes: BigInt(doc.sizeBytes),
            hashSha256: doc.hashSha256 ?? null,
            uploadedAt: new Date()
          }))
        }
        : undefined
    },
    include: {
      personalInfo: true,
      sectors: true,
      documents: true
    }
  });



  await logAuditEvent({
    action: "APPLICATION_CREATE",
    targetType: "applications",
    targetId: created.id,
    outcome: "success",
    metadata: {
      personalInfo: {
        email: created.personalInfo?.email,
        firstName: created.personalInfo?.firstName
      },
      sectorCount: sectors?.length ?? 0
    },
    tokenScopeSnapshot: scopes,
    tokenFilterSnapshot: created.tokenFilterSnapshot as Record<string, unknown> | null,
    actorUserId: payload.sub ?? null
  });

  return NextResponse.json(serializeApplication(created), { status: 201 });
}

export async function GET(request: Request) {
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
      action: "APPLICATION_LIST",
      targetType: "applications",
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

  const applications = await prisma.application.findMany({
    where: filterList.length
      ? {
        tokenFilterSnapshot: {
          path: ["filters"],
          array_contains: filterList
        }
      }
      : undefined,
    include: {
      personalInfo: true,
      sectors: { include: { sector: true } },
      documents: true
    },
    orderBy: { createdAt: "desc" }
  });

  await logAuditEvent({
    action: "APPLICATION_LIST",
    targetType: "applications",
    outcome: "success",
    metadata: { count: applications.length },
    tokenScopeSnapshot: scopes,
    tokenFilterSnapshot: filterList.length ? { filters: filterList } : null,
    actorUserId: payload.sub ?? null
  });

  return NextResponse.json(applications.map((app) => serializeApplication(app)));
}
