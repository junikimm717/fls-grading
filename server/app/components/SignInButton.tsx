"use client";

import { redirect } from "next/navigation";

export default function SignInButton() {
  return (
    <button
      onClick={() => redirect("/auth/login")}
      className="text-left text-blue-600 hover:text-blue-700 hover:underline w-fit"
    >
      Log in
    </button>
  );
}
