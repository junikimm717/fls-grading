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
    <div className="p-4 space-y-2 bg-white border">
      <div className="flex justify-between">
        Submission ID #{submission.id}
        <span className="text-sm text-gray-600">
          {new Date(submission.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="text-sm">
        <strong>Creator:</strong>
        <span
          className="p-2 font-mono max-w-[8rem] truncate"
          title={user.email}
        >
          {isAdmin ? (
            <Link className="underline" href={`/admin/users/${user.id}`}>
              {user.email}
            </Link>
          ) : (
            <>{user.email}</>
          )}
        </span>
      </div>

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
