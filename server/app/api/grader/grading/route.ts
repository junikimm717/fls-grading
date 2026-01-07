import { db } from "@/app/db";
import { apiKeyTable } from "@/app/db/schema";
import { requireAdmin } from "@/app/lib/apikey";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return new Response("Unauthorized", { status: auth.status });
  }
  if (!auth.key) {
    throw Error("Impossible, auth.ok is true but auth.key doesn't exist");
  }
  await db
    .update(apiKeyTable)
    .set({ pingedAt: Date.now(), isGrading: 1 })
    .where(eq(apiKeyTable.id, auth.key.keyId));

  // we need to consume the worker

  return new Response("Pong");
}
