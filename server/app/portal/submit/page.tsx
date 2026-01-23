import { auth } from "@/app/lib/auth";
import { notFound, redirect } from "next/navigation";

import { db } from "@/app/db";
import { usersTable, submissionTable } from "@/app/db/schema";
import { SubmissionStatus } from "@/app/db/types";

import { eq } from "drizzle-orm";

import { FILESDIR } from "@/app/lib/env";
import { deleteSubmissionArtifacts } from "@/app/lib/submissions";

import path from "path";
import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { SubmissionError } from "@/app/components/submission/types";

/* =========================
   Policy constants
   ========================= */

const MAX_WAITING = 3;
const MAX_FAILED = 3;
const MAX_PASSED = 1;

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_ARCH = new Set(["x86_64", "aarch64"] as const);

const DEADLINE_EST = new Date("2026-01-31T04:59:00Z");

type Arch = "x86_64" | "aarch64";

/* =========================
   Helpers
   ========================= */

function assertArch(x: string): asserts x is Arch {
  if (!ALLOWED_ARCH.has(x as Arch)) {
    throw new SubmissionError("Invalid architecture");
  }
}

function sanitizeBaseName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function saveTarballToFilesDir(file: File, userId: string) {
  if (!file.name.endsWith(".tar.gz")) {
    throw new SubmissionError("Only .tar.gz files are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new SubmissionError("File too large (max 5MB).");
  }

  const tarballsDir = path.join(FILESDIR, "tarballs");
  await mkdir(tarballsDir, { recursive: true });

  const original = sanitizeBaseName(path.basename(file.name));
  const nonce = crypto.randomBytes(12).toString("hex");
  const filename = `submission_${userId}_${Date.now()}_${nonce}_${original}`;

  const fullPath = path.join(tarballsDir, filename);

  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buf, { flag: "wx" });

  return filename;
}

/* =========================
   Server Action
   ========================= */

async function createSubmission(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) notFound();

  const now = new Date();
  if (now > DEADLINE_EST) {
    throw new SubmissionError(
      "The submission deadline (Jan 30, 11:59 PM EST) has passed."
    );
  }

  const userId = session.user.id;

  const archRaw = String(formData.get("arch") ?? "");
  assertArch(archRaw);
  const arch = archRaw;

  // --------------------------------
  // Load existing submissions (user)
  // --------------------------------
  const submissions = await db
    .select()
    .from(submissionTable)
    .where(eq(submissionTable.userId, userId));

  const sameArch = submissions.filter((s) => s.arch === arch);

  // --------------------------------
  // Enforce WAITING backpressure
  // --------------------------------
  const waitingCount = sameArch.filter(
    (s) => s.pending === SubmissionStatus.WAITING,
  ).length;

  if (waitingCount >= MAX_WAITING) {
    throw new SubmissionError(
      "You already have too many submissions waiting to be graded. Please wait.",
    );
  }

  // --------------------------------
  // Save tarball
  // --------------------------------
  const file = formData.get("tarball");
  if (!(file instanceof File)) {
    throw new SubmissionError("Missing tarball upload.");
  }

  const tarballBasename = await saveTarballToFilesDir(file, userId);

  // --------------------------------
  // Update preferred arch
  // --------------------------------
  await db
    .update(usersTable)
    .set({ preferredArch: arch })
    .where(eq(usersTable.id, userId));

  // --------------------------------
  // Insert new submission
  // --------------------------------
  await db.insert(submissionTable).values({
    userId,
    arch,
    tarball: tarballBasename,
    pending: SubmissionStatus.WAITING,
    createdAt: new Date(),
  });

  // --------------------------------
  // Cleanup graded submissions
  // --------------------------------
  const graded = sameArch
    .filter((s) => s.pending === SubmissionStatus.COMPLETED)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const passed = graded.filter((s) => s.passed === 1);
  const failed = graded.filter((s) => s.passed === 0);

  const passedToDelete = passed.slice(MAX_PASSED);
  const failedToDelete = failed.slice(MAX_FAILED);

  const toDelete = [...passedToDelete, ...failedToDelete];

  for (const sub of toDelete) {
    await db.delete(submissionTable).where(eq(submissionTable.id, sub.id));

    await deleteSubmissionArtifacts(sub);
  }

  redirect("/portal");
}

/* =========================
   Page Component
   ========================= */

export default async function NewSubmissionPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      preferredArch: usersTable.preferredArch,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  if (!user) notFound();

  const defaultArch: Arch =
    user.preferredArch === "aarch64" || user.preferredArch === "x86_64"
      ? user.preferredArch
      : "x86_64";

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white border">
        <div className="text-sm text-gray-600">Submitting as</div>
        <div className="font-mono">{user.email}</div>
      </div>

      <form action={createSubmission} className="p-4 space-y-4 bg-white border">
        <div>
          <label className="block mb-1 text-sm font-medium">
            Tarball (.tar.gz, max 5MB)
          </label>
          <input
            type="file"
            name="tarball"
            accept=".gz,application/gzip"
            required
            className="block w-full text-sm text-gray-700 focus:outline-none
            file:mr-4 file:py-1 file:px-2 file:border-none
            file:bg-gray-100 file:text-gray-700"
          />
        </div>

        <div>
          <div className="block mb-1 text-sm font-medium">Architecture</div>
          <div className="flex gap-4">
            <label className="flex gap-2 items-center text-sm">
              <input
                type="radio"
                name="arch"
                value="x86_64"
                defaultChecked={defaultArch === "x86_64"}
              />
              x86_64
            </label>

            <label className="flex gap-2 items-center text-sm">
              <input
                type="radio"
                name="arch"
                value="aarch64"
                defaultChecked={defaultArch === "aarch64"}
              />
              aarch64
            </label>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Default is your saved preference (or x86_64 if unset).
          </div>
        </div>

        <button type="submit" className="py-2 px-3 text-white bg-blue-600">
          Submit
        </button>
      </form>
    </div>
  );
}
