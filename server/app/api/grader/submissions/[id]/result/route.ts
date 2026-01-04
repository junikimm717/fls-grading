import { db } from "@/app/db";
import { submissionTable, usersTable } from "@/app/db/schema";
import { SubmissionStatus } from "@/app/db/types";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { FILESDIR } from "@/app/lib/env";
import { gradeSubmission } from "@/app/lib/users";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const form = await req.formData();
  const submissionId = Number((await params).id);

  const passed = form.get("passed") === "true";
  const logs = form.get("logs") as File;

  const [row] = await db
    .select()
    .from(submissionTable)
    .where(
      and(
        eq(submissionTable.id, submissionId),
        eq(submissionTable.pending, SubmissionStatus.GRADING),
      ),
    )
    .limit(1);

  if (!row) {
    return new Response("Forbidden", { status: 403 });
  }

  const logsDir = path.join(FILESDIR, "logs");
  await fs.mkdir(logsDir, { recursive: true });
  const logName = `submission-${submissionId}.log`;

  const logPath = path.join(logsDir, logName);
  await fs.writeFile(logPath, Buffer.from(await logs.arrayBuffer()));

  await gradeSubmission(submissionId, passed);

  // update the db with the actual path to the logs.
  await db
    .update(submissionTable)
    .set({
      logs: logName,
    })
    .where(eq(submissionTable.id, Number(submissionId)));

  return new Response("ok");
}
