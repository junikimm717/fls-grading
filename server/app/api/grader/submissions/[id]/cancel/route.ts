import { db } from "@/app/db";
import { submissionTable } from "@/app/db/schema";
import { SubmissionStatus } from "@/app/db/types";
import { eq, and } from "drizzle-orm";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const updated = await db
    .update(submissionTable)
    .set({
      pending: SubmissionStatus.WAITING,
    })
    .where(
      and(
        eq(submissionTable.id, Number((await params).id)),
        eq(submissionTable.pending, SubmissionStatus.GRADING),
      ),
    )
    .returning();

  if (updated.length === 0) {
    return new Response("Nothing in grading status", { status: 200 });
  }

  return Response.json(updated[0]);
}
