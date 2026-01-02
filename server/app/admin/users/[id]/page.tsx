import { auth } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/app/db";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { UserSubmissions } from "@/app/components/UserSubmissions";
import Link from "next/link";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = (await params).id;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      passed: usersTable.passed,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="px-4 bg-white">
        <Link className="underline text-blue-700" href={`/admin`}>
          Back to Home
        </Link>
      </div>
      {/* Header */}
      <div className="border rounded p-4 bg-white">
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

      {/* Submissions */}
      <UserSubmissions userId={user.id} />
    </div>
  );
}
