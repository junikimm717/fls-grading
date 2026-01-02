"use client";

import { SubmissionRow } from "./types";
import { SubmissionTable } from "./SubmissionTable";
import { SubmissionCards } from "./SubmissionCards";

type Props = {
  submissions: SubmissionRow[];
  isAdmin: boolean;
};

export function SubmissionListClient({ submissions, isAdmin }: Props) {
  if (submissions.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No submissions yet.
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <SubmissionTable submissions={submissions} isAdmin={isAdmin} />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        <SubmissionCards submissions={submissions} isAdmin={isAdmin} />
      </div>
    </>
  );
}
