import { auth } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/app/db";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { UserSubmissions } from "@/app/components/UserSubmissions";
import { AvailableWorkers } from "../components/AvailableWorkers";

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
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border rounded p-4 bg-white">
        <div className="text-sm text-gray-600">Logged in as</div>
        <div className="text-lg font-mono">{user.email}</div>

        <div className="mt-2">
          <span className="font-semibold">Course status:</span>{" "}
          {user.passed === 1 ? (
            <span className="text-green-600 font-semibold">PASSED</span>
          ) : (
            <span className="text-red-600 font-semibold">NOT PASSED</span>
          )}
        </div>
      </div>

      <AvailableWorkers />

      {/* Submissions */}
      <UserSubmissions userId={user.id} />
    </div>
  );
}
