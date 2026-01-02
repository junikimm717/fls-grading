import { db } from "@/app/db";
import { submissionTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { FILESDIR } from "@/app/lib/env";
import fs from "fs/promises";
import path from "path";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rows = await db
    .select({ tarball: submissionTable.tarball })
    .from(submissionTable)
    .where(eq(submissionTable.id, Number((await params).id)))
    .limit(1);

  if (rows.length === 0 || !rows[0].tarball) {
    return new Response("Not found", { status: 404 });
  }

  const tarballPath = path.join(FILESDIR, rows[0].tarball);
  const data = await fs.readFile(tarballPath);

  return new Response(data, {
    headers: {
      "content-type": "application/gzip",
      "content-disposition": `attachment`,
    },
  });
}
