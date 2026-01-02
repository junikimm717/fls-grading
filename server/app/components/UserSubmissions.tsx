import { db } from "@/app/db";
import { submissionTable } from "@/app/db/schema";
import { desc, eq } from "drizzle-orm";
import { isAdminQuery } from "@/app/lib/is-admin";
import { SubmissionListClient } from "./submission/SubmissionListClient";

type Props = {
  userId: string;
};

export async function UserSubmissions({ userId }: Props) {
  const submissions = await db
    .select({
      id: submissionTable.id,
      createdAt: submissionTable.createdAt,
      passed: submissionTable.passed,
      pending: submissionTable.pending,
    })
    .from(submissionTable)
    .where(eq(submissionTable.userId, userId))
    .orderBy(desc(submissionTable.createdAt));

  const isAdmin = await isAdminQuery();

  return (
    <SubmissionListClient
      submissions={submissions}
      isAdmin={isAdmin}
    />
  );
}
