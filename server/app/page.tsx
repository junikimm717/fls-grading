import { redirect } from "next/navigation";
import { auth } from "./lib/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ notallowed?: string }>;
}) {
  const params = await searchParams;
  const notAllowed = params.notallowed === "true";
  const session = await auth();

  if (session && params.notallowed === "true") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {notAllowed && (
        <p className="text-red-700">
          You are not registered for this course. Note you must log in with your{" "}
          <strong>MIT email</strong>.
        </p>
      )}
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome to 6.S913
      </h1>

      <p className="text-gray-700">
        This site serves as the submission portal for{" "}
        <strong>6.S913 — Fundamentals of Linux Systems</strong>.
      </p>

      <p className="text-gray-700">
        The official course page, including the syllabus, lectures, and
        assignment materials, is available here:
      </p>

      <p>
        <a
          href="https://junic.kim/en/6s913"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline underline-offset-4"
        >
          https://junic.kim/en/6s913
        </a>
      </p>

      <hr className="border-gray-200" />

      <p className="text-sm text-gray-600">
        <strong>Note:</strong> Access to this portal is restricted to students
        registered for credit in the course. If you believe you should have
        access but cannot sign in, please contact the course staff.
      </p>
    </div>
  );
}
