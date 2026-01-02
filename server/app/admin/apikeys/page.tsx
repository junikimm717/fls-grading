import { db } from "@/app/db";
import { apiKeyTable, usersTable } from "@/app/db/schema";
import { isNull, asc, eq } from "drizzle-orm";

import { ApiKeysList } from "./ApiKeysList";

export default async function AdminApiKeysPage() {
  const keys = await db
    .select({
      id: apiKeyTable.id,
      name: apiKeyTable.name,
      createdAt: apiKeyTable.createdAt,
      email: usersTable.email
    })
    .from(apiKeyTable)
    .innerJoin(usersTable, eq(usersTable.id, apiKeyTable.userId))
    .where(isNull(apiKeyTable.revokedAt))
    .orderBy(asc(apiKeyTable.createdAt));

  return <ApiKeysList keys={keys} />;
}
