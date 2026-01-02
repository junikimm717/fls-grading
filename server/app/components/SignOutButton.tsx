"use client";

import { signOut } from "next-auth/react";


export default function SignOutButton() {
  return (
    <button
      type="submit"
      className="text-red-600 hover:text-red-700 hover:underline text-left"
      onClick={() => signOut()}
    >
      Log Out
    </button>
  );
}
