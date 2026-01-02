"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="text-blue-600 hover:text-blue-700 hover:underline"
    >
      Log in
    </button>
  );
}
