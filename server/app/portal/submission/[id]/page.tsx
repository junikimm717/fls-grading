import { OneSubmission } from "@/app/components/submission/OneSubmission";
import { db } from "@/app/db";
import { submissionTable, usersTable } from "@/app/db/schema";
import { auth } from "@/app/lib/auth";
import { isAdminQuery } from "@/app/lib/is-admin";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function PortalSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const submissionId = Number((await params).id);
  if (!Number.isFinite(submissionId)) {
    notFound();
  }
  const isAdmin = await isAdminQuery();

  if (!session?.user?.id) {
    notFound();
  }

  // note that session!.user!.id! is protected by the routes above.
  const [submission] = await db
    .select()
    .from(submissionTable)
    .innerJoin(usersTable, eq(usersTable.id, submissionTable.userId))
    .where(
      and(
        eq(submissionTable.id, submissionId),
        isAdmin ? undefined : eq(submissionTable.userId, session!.user!.id!),
      ),
    );

  if (!submission) {
    notFound();
  }
  const isOwner = submission.user.id === session.user.id;

  if (!isAdmin && !isOwner) {
    notFound();
  }

  return <OneSubmission submission={submission} />;
}
