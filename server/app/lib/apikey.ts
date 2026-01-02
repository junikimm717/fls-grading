"use server";

import { createHash, randomBytes } from "crypto";
import { db } from "../db";
import { auth } from "./auth";
import { apiKeyTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { isAdminQuery } from "./is-admin";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function generateKeyId() {
  // short, URL-safe, non-secret
  return randomBytes(8).toString("hex");
}

function generateSecret() {
  return randomBytes(32).toString("base64url");
}

export async function createApiKey(name?: string) {
  const isAdmin = await isAdminQuery();
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Session user doesn't exist");
  }

  const keyId = generateKeyId();
  const secret = generateSecret();

  const rawKey = `ak_${keyId}.${secret}`;

  await db.insert(apiKeyTable).values({
    id: keyId,
    userId: session.user.id,
    hash: sha256(secret),
    name,
    createdAt: new Date(),
  });

  return rawKey;
}

export async function revokeApiKey(keyId: string) {
  const [key] = await db
    .select()
    .from(apiKeyTable)
    .where(eq(apiKeyTable.id, keyId));
  if (!key) {
    throw new Error("API Key doesn't exist");
  }
  await db
    .update(apiKeyTable)
    .set({
      revokedAt: Date.now(),
    })
    .where(eq(apiKeyTable.id, keyId));
}

export async function verifyApiKey(rawKey: string) {
  // Expected format: ak_<id>.<secret>
  if (!rawKey.startsWith("ak_")) return null;

  const body = rawKey.slice(3);
  const parts = body.split(".");
  if (parts.length !== 2) return null;

  const [keyId, secret] = parts;

  const hash = sha256(secret);

  const rows = await db
    .select({
      keyId: apiKeyTable.id,
      userId: apiKeyTable.userId,
      revokedAt: apiKeyTable.revokedAt,
      hash: apiKeyTable.hash,
      isAdmin: usersTable.admin,
    })
    .from(apiKeyTable)
    .innerJoin(usersTable, eq(usersTable.id, apiKeyTable.userId))
    .where(eq(apiKeyTable.id, keyId))
    .limit(1);

  if (rows.length === 0) return null;

  const key = rows[0];

  if (key.revokedAt !== null) return null;
  if (key.hash !== hash) return null;

  return key;
}
