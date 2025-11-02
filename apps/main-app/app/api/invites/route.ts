import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/logging";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["register_invite", "view_invite"]),
  scopes: z.array(z.string()).nonempty(),
  filters: z.array(z.string()).optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  createdById: z.string().uuid(),
  inviteeName: z.string().min(3),
  adminToken: z.string().min(10)
});

export async function POST(request: Request) {
  const json = await request.json();
  const body = schema.safeParse(json);

  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { adminToken, ...payload } = body.data;
  const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:4000";

  const response = await fetch(`${authServiceUrl}/invites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify(payload)
  });

  const jsonResponse = await response.json().catch(() => null);

  await logAuditEvent({
    action: "INVITE_CREATE_API",
    targetType: "invites",
    targetId: jsonResponse?.inviteId ?? null,
    outcome: response.ok ? "success" : "error",
    metadata: {
      status: response.status,
      scopes: payload.scopes
    }
  });

  if (!response.ok) {
    return NextResponse.json(jsonResponse ?? { error: "AUTH_SERVICE_ERROR" }, {
      status: response.status
    });
  }

  return NextResponse.json(jsonResponse, { status: 201 });
}
