import { db } from "@/app/db";
import { submissionTable } from "@/app/db/schema";
import { SubmissionStatus } from "@/app/db/types";
import { requireAdmin } from "@/app/lib/apikey";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return new Response("Unauthorized", { status: auth.status });
  }

  const updated = await db
    .update(submissionTable)
    .set({
      pending: SubmissionStatus.GRADING,
    })
    .where(
      and(
        eq(submissionTable.id, Number((await params).id)),
        eq(submissionTable.pending, SubmissionStatus.WAITING),
      ),
    )
    .returning();

  if (updated.length === 0) {
    return new Response("Already claimed", { status: 409 });
  }

  return Response.json(updated[0]);
}
