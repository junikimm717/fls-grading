import { db } from "@/app/db";
import { submissionTable } from "@/app/db/schema";
import { SubmissionStatus } from "@/app/db/types";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { FILESDIR } from "@/app/lib/env";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const form = await req.formData();
  const submissionId = (await params).id;

  const passed = form.get("passed") === "true";
  const logs = form.get("logs") as File;

  const rows = await db
    .select()
    .from(submissionTable)
    .where(
      and(
        eq(submissionTable.id, Number(submissionId)),
        eq(submissionTable.pending, SubmissionStatus.GRADING),
      ),
    )
    .limit(1);

  if (rows.length === 0) {
    return new Response("Forbidden", { status: 403 });
  }

  const logPath = path.join(FILESDIR, `submission-${submissionId}.log`);
  await fs.writeFile(logPath, Buffer.from(await logs.arrayBuffer()));

  await db
    .update(submissionTable)
    .set({
      passed: passed ? 1 : 0,
      logs: logPath,
      pending: SubmissionStatus.COMPLETED,
    })
    .where(eq(submissionTable.id, Number(submissionId)));

  return new Response("ok");
}
