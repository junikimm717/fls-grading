import Link from "next/link";
import { db } from "@/app/db";
import { magicLinkTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { hashToken, confirmMagicLink } from "@/app/lib/magiclink";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token;
  if (!token) {
    return <Invalid />;
  }

  const tokenHash = await hashToken(token);

  const [record] = await db
    .select()
    .from(magicLinkTable)
    .where(eq(magicLinkTable.tokenHash, tokenHash))
    .limit(1);

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return <Invalid />;
  }

  return (
    <div className="mx-auto space-y-6 max-w-2xl">
      <div className="p-4 max-w-sm border">
        <h1 className="font-mono text-lg">Confirm sign-in</h1>

        <p className="mt-2 text-sm">You are signing in as:</p>

        <p className="mt-1 font-mono text-sm">{record.email}</p>

        <form action={confirmMagicLink} className="mt-4">
          <input type="hidden" name="token" value={token} />

          <button type="submit" className="text-sm text-blue-600 underline">
            Confirm sign-in
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-600">
          You must explicitly confirm sign-in because MIT email systems may open
          links automatically.
        </p>
      </div>
    </div>
  );
}

function Invalid() {
  return (
    <div className="mx-auto space-y-6 max-w-2xl">
      <div className="p-4 max-w-sm border">
        <h1 className="font-mono text-lg">Invalid or expired link</h1>

        <p className="mt-2 text-sm">This sign-in link is no longer valid.</p>

        <Link
          href="/auth/login"
          className="inline-block mt-3 text-sm text-blue-600 underline"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
}
