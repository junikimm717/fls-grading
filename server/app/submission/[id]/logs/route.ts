import { auth } from "@/app/lib/auth";
import { db } from "@/app/db";
import { submissionTable } from "@/app/db/schema";
import { FILESDIR } from "@/app/lib/env";
import { isAdminQuery } from "@/app/lib/is-admin";
import { eq } from "drizzle-orm";

import fs from "fs";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const submissionId = Number((await params).id);
  if (!Number.isFinite(submissionId)) {
    return new Response("Not found", { status: 404 });
  }

  const [submission] = await db
    .select({
      userId: submissionTable.userId,
      logs: submissionTable.logs,
    })
    .from(submissionTable)
    .where(eq(submissionTable.id, submissionId))
    .limit(1);

  if (!submission || !submission.logs) {
    return new Response("Not found", { status: 404 });
  }

  const isAdmin = await isAdminQuery();
  const isOwner = submission.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    return new Response("Forbidden", { status: 403 });
  }

  const logsDir = path.join(FILESDIR, "logs");
  await fs.promises.mkdir(logsDir, { recursive: true });

  const filePath = path.join(logsDir, submission.logs);
  if (!fs.existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const stream = fs.createReadStream(filePath);

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
