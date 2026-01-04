"use server";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable, submissionTable } from "../db/schema";
import { SubmissionStatus } from "../db/types";
import { isAdminQuery } from "./is-admin";

export async function promoteUserAction(userId: string, admin: boolean) {
  if (!(await isAdminQuery())) {
    throw new Error("Unauthorized");
  }
  await db
    .update(usersTable)
    .set({ admin: admin ? 1 : 0, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
}

export async function deleteUserAction(userId: string) {
  if (!(await isAdminQuery())) {
    throw new Error("Unauthorized");
  }
  await db.delete(usersTable).where(eq(usersTable.id, userId));
}

export async function gradeUserAction(userId: string, passed: boolean) {
  if (!(await isAdminQuery())) {
    throw new Error("Unauthorized");
  }
  await db
    .update(usersTable)
    .set({ passed: passed ? 1 : 0, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
}

export async function gradeSubmissionAction(
  submissionId: number,
  passed: boolean,
) {
  if (!(await isAdminQuery())) {
    throw new Error("Unauthorized");
  }
  await gradeSubmission(submissionId, passed);
}

// actual logic for grading submissions
export async function gradeSubmission(submissionId: number, passed: boolean) {
  const passedInt = passed ? 1 : 0;
  const query = await db
    .select({ userId: submissionTable.userId })
    .from(submissionTable)
    .where(eq(submissionTable.id, submissionId));
  if (query.length === 0) {
    throw new Error(`No submission found with submission id ${submissionId}`);
  }
  const userId = query[0].userId;
  await db
    .update(submissionTable)
    .set({ passed: passedInt, pending: SubmissionStatus.COMPLETED })
    .where(eq(submissionTable.id, submissionId));
  if (passed) {
    await db
      .update(usersTable)
      .set({ passed: passedInt, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
  }
}

export async function addUsersAction(emails: string[]) {
  if (!(await isAdminQuery())) {
    throw new Error("Unauthorized");
  }
  const normalized = emails
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  if (normalized.length === 0) return;

  await db.transaction(async (tx) => {
    await tx
      .insert(usersTable)
      .values(
        normalized.map((email) => ({
          email,
          admin: 0,
          passed: null,
        })),
      )
      .onConflictDoNothing({ target: usersTable.email });
  });
}
