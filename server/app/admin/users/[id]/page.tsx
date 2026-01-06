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
    <div className="py-6 px-4 mx-auto space-y-6 max-w-5xl">
      <div className="px-4 bg-white">
        <Link className="text-blue-700 underline" href={`/admin`}>
          Back to Home
        </Link>
      </div>
      {/* Header */}
      <div className="p-4 bg-white border">
        <div className="font-mono text-lg">{user.email}</div>

        <div className="mt-2">
          <span className="font-semibold">Course status:</span>{" "}
          {user.passed === 1 ? (
            <span className="font-semibold text-green-600">PASSED</span>
          ) : (
            <span className="font-semibold text-red-600">NOT PASSED</span>
          )}
        </div>
      </div>

      {/* Submissions */}
      <UserSubmissions userId={user.id} />
    </div>
  );
}
