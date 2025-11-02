import { jwtVerify, type JWTPayload } from "jose";
import { cache } from "react";

const encoder = new TextEncoder();

export interface InviteTokenPayload extends JWTPayload {
  scope?: string[];
  "filter-list"?: string[];
}

const getPublicKey = cache(async () => {
  const publicPem = process.env.AUTH_PUBLIC_KEY;
  if (!publicPem) {
    throw new Error("AUTH_PUBLIC_KEY is not configured");
  }

  const cleaned = publicPem.replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  const binaryDer = Buffer.from(cleaned, "base64");

  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["verify"]
  );
});

export async function verifyInviteToken(token: string) {
  const key = await getPublicKey();
  const { payload } = await jwtVerify(token, key);
  return payload as InviteTokenPayload;
}
