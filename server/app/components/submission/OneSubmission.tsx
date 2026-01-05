import Link from "next/link";
import { SubmissionView } from "./types";
import { isAdminQuery } from "@/app/lib/is-admin";
import RenderStatus from "./RenderStatus";

export async function OneSubmission({
  submission: { submission, user },
  showUserActions = true,
}: {
  submission: SubmissionView;
  showUserActions?: boolean;
}) {
  const isAdmin = await isAdminQuery();
  return (
    <div className="border rounded p-4 bg-white space-y-2">
      <div className="flex justify-between">
        Submission ID #{submission.id}
        <span className="text-sm text-gray-600">
          {new Date(submission.createdAt).toLocaleString()}
        </span>
      </div>

      {isAdmin && (
        <div className="text-sm">
          <strong>Creator:</strong>{" "}
          <Link className="underline" href={`/admin?email=${user.email}`}>
            {user.email}
          </Link>
        </div>
      )}

      <div className="text-sm">
        <strong>Architecture:</strong> {submission.arch}
      </div>

      <div className="text-sm">
        <strong>Status:</strong>{" "}
        <RenderStatus status={submission.pending} passed={submission.passed} />
      </div>

      {showUserActions && (
        <div className="flex gap-4 pt-2 text-sm">
          {submission.tarball && (
            <a
              href={`/submission/${submission.id}/tarball`}
              className="underline"
            >
              Download tarball
            </a>
          )}

          {submission.logs && (
            <a href={`/submission/${submission.id}/logs`} className="underline">
              Download logs
            </a>
          )}
        </div>
      )}
    </div>
  );
}
