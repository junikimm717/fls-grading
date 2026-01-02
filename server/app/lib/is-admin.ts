import { cache } from "react";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/db";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { DICTATOR } from "@/app/lib/env";

export const isAdminQuery = cache(async () => {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return false;

  if (session.user.email === DICTATOR) return true;

  const [row] = await db
    .select({ admin: usersTable.admin })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  return row?.admin === 1;
});
