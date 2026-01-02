"use client";

import { signIn, signOut } from "./auth";

export async function loginClient() {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutClient() {
  await signOut({ redirectTo: "/" });
}
