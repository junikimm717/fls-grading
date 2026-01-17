import { auth } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/app/db";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { UserSubmissions } from "@/app/components/UserSubmissions";
import { AvailableWorkers } from "../components/AvailableWorkers";
import Link from "next/link";

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      passed: usersTable.passed,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  if (!user) notFound();

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 bg-white border">
        <div className="text-sm text-gray-600">Logged in as</div>
        <div className="font-mono text-base">{user.email}</div>

        <div className="mt-2">
          <span className="font-semibold">Course status:</span>{" "}
          {user.passed === 1 ? (
            <span className="font-semibold text-green-600">PASSED</span>
          ) : (
            <span className="font-semibold text-red-600">NOT PASSED</span>
          )}
        </div>
        <div className="mt-4">
          <Link
            href="/portal/submit"
            className="py-2 px-3 text-white bg-blue-600"
          >
            Submit Assignment
          </Link>
        </div>
      </div>

      <AvailableWorkers />

      {/* Submissions */}
      <UserSubmissions userId={user.id} />
    </div>
  );
}
