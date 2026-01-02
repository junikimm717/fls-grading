import { FILESDIR } from "@/app/lib/env";
import path from "path";
import fs from "fs";

export async function deleteSubmissionArtifacts(submission: {
  id: number;
  tarball: string | null;
  logs: string | null;
}) {
  const ops: Promise<unknown>[] = [];

  if (submission.tarball) {
    const tarballPath = path.join(FILESDIR, "tarballs", submission.tarball);
    ops.push(fs.promises.rm(tarballPath, { force: true }));
  }

  if (submission.logs) {
    const logPath = path.join(FILESDIR, "logs", submission.logs);
    ops.push(fs.promises.rm(logPath, { force: true }));
  }

  // Best-effort cleanup: DB is already source of truth
  await Promise.allSettled(ops);
}
