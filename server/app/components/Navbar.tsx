import { auth } from "@/app/lib/auth";
import Link from "next/link";
import { isAdminQuery } from "../lib/is-admin";
import SignOutButton from "./SignOutButton";
import SignInButton from "./SignInButton";

export default async function Navbar() {
  const session = await auth();
  const isAdmin = await isAdminQuery();
  const email = session?.user?.email;

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="text-lg font-semibold tracking-tight">
          <Link href="/" className="hover:underline">
            6.S913
          </Link>
        </div>

        {/* Right: everything else */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 text-base sm:text-sm">
          {session ? (
            <>
              {/* Nav links */}
              <div className="flex gap-4">
                <Link
                  href="/portal"
                  className="text-gray-700 hover:text-black hover:underline"
                >
                  Portal
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-black hover:underline"
                  >
                    Admin
                  </Link>
                )}
              </div>

              {/* Email */}
              <span className="text-gray-500">{email}</span>

              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </nav>
  );
}
