import { AvailableWorkers } from "@/app/components/AvailableWorkers";
import { SubmissionListClient } from "@/app/components/submission/SubmissionListClient";
import { db } from "@/app/db";
import { submissionTable, usersTable } from "@/app/db/schema";
import { isAdminQuery } from "@/app/lib/is-admin";
import { desc, eq } from "drizzle-orm";

export default async function AdminSubmissionsPage() {
  const isAdmin = await isAdminQuery();
  const submissions = await db
    .select({
      id: submissionTable.id,
      createdAt: submissionTable.createdAt,
      passed: submissionTable.passed,
      pending: submissionTable.pending,
      arch: submissionTable.arch,
      userEmail: usersTable.email,
      userId: usersTable.id,
    })
    .from(submissionTable)
    .innerJoin(usersTable, eq(usersTable.id, submissionTable.userId))
    .orderBy(desc(submissionTable.createdAt))
    .limit(20);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold mb-4">Recent Submissions</h1>
      <AvailableWorkers />
      <div className="m-3" />
      <SubmissionListClient isAdmin={isAdmin} submissions={submissions} />
    </div>
  );
}
