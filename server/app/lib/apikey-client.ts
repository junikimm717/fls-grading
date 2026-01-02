"use client";

import { createApiKey, revokeApiKey } from "./apikey";

export async function createApiKeyClient(name?: string) {
  return await createApiKey(name);
}

export async function revokeApiKeyClient(keyId: string) {
  return await revokeApiKey(keyId);
}
