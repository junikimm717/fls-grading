import { db } from "@/app/db";
import { submissionTable } from "@/app/db/schema";
import { SubmissionStatus } from "@/app/db/types";
import { requireAdmin } from "@/app/lib/apikey";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return new Response("Unauthorized", { status: auth.status });
  }

  const arch = new URL(req.url).searchParams.get("arch");
  if (!arch) {
    return new Response("arch required", { status: 400 });
  }

  const rows = await db
    .select({
      id: submissionTable.id,
      userId: submissionTable.userId,
      tarball: submissionTable.tarball,
      arch: submissionTable.arch,
      createdAt: submissionTable.createdAt,
    })
    .from(submissionTable)
    .where(
      and(
        eq(submissionTable.pending, SubmissionStatus.WAITING),
        eq(submissionTable.arch, arch),
      ),
    )
    .limit(10);

  return Response.json(rows);
}
