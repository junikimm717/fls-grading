"use server";

import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "@/app/db";
import { magicLinkTable, usersTable } from "@/app/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { DICTATOR, SES_SMTP_EMAIL, SES_SMTP_HOST, SES_SMTP_PASS, SES_SMTP_USER } from "./env";
import { signIn } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { ResultWithReason } from "../db/types";

const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const RESEND_MS = 2 * 60 * 1000; // 2 minutes

export async function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const transporter = nodemailer.createTransport({
  host: SES_SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: SES_SMTP_USER,
    pass: SES_SMTP_PASS,
  },
});

export async function sendEmail(to: string, url: string) {
  await transporter.sendMail({
    from: `6.S913 <${SES_SMTP_EMAIL}>`,
    to,
    subject: "6.S913 Sign-in Link",
    text: `Sign in to the MIT 6.S913 submission portal:

${url}

This link expires in 15 minutes.

If you did not request this email, you can ignore it.`,
  });
}

async function allowUserLogin(email: string): Promise<ResultWithReason> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  // Non-dictator must already exist
  if (!user && email !== DICTATOR) {
    return {
      ok: false,
      reason: "Please ask staff to create an account for you.",
    };
  }

  // Rate limit applies whenever a row exists
  if (
    user?.lastRequested &&
    Date.now() < user.lastRequested.getTime() + RESEND_MS
  ) {
    return {
      ok: false,
      reason: "You have been rate limited. Please try sending the code later.",
    };
  }

  return { ok: true };
}

export async function requestMagicLink(
  email: string,
): Promise<ResultWithReason> {
  email = email.trim().toLowerCase();

  const login = await allowUserLogin(email);
  if (!login.ok) {
    return login;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = await hashToken(rawToken);

  await db.insert(magicLinkTable).values({
    tokenHash,
    email,
    expiresAt: new Date(Date.now() + EXPIRY_MS),
  });
  await db
    .update(usersTable)
    .set({ lastRequested: new Date() })
    .where(eq(usersTable.email, email));

  const url = `${process.env.NEXTAUTH_URL}/auth/magic/verify?token=${rawToken}`;

  try {
    await sendEmail(email, url);
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }

  return { ok: true };
}

// logic to confirm the magic link (we only go to this after confirmation)
export async function confirmMagicLink(formData: FormData) {
  const rawToken = formData.get("token");
  if (typeof rawToken !== "string") {
    throw new Error("Invalid token");
  }

  const tokenHash = await hashToken(rawToken);

  // Atomically consume token
  const [record] = await db
    .select()
    .from(magicLinkTable)
    .where(
      and(
        eq(magicLinkTable.tokenHash, tokenHash),
        isNull(magicLinkTable.usedAt),
      ),
    )
    .limit(1);

  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new Error("Expired or invalid link");
  }

  await db
    .update(magicLinkTable)
    .set({ usedAt: new Date() })
    .where(eq(magicLinkTable.tokenHash, tokenHash));

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, record.email))
    .limit(1);

  if (!user && record.email === DICTATOR) {
    [user] = await db
      .insert(usersTable)
      .values({
        email: record.email,
        admin: 1,
      })
      .returning();
  } else if (!user) {
    throw new Error("User no longer exists");
  }

  // hand off to auth.js
  await signIn("magic", {
    userId: user.id,
    redirect: false,
  });

  redirect("/portal");
}
