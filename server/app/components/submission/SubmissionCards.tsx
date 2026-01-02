"use client";

import { SubmissionRow } from "./types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmActionModal } from "@/app/components/ConfirmActionModal";
import { gradeSubmissionClient } from "@/app/lib/users-client";
import { SubmissionStatus } from "@/app/db/types";

export function SubmissionCards({
  submissions,
  isAdmin,
}: {
  submissions: SubmissionRow[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<{
    id: number;
    nextPassed: boolean;
  } | null>(null);

  return (
    <>
      {submissions.map((s) => (
        <div key={s.id} className="border rounded p-3 bg-white">
          <div className="flex justify-between">
            <a
              href={`/portal/submission/${s.id}`}
              className="font-mono text-blue-600 underline"
            >
              #{s.id}
            </a>
            <span className="text-sm">
              {new Date(s.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="text-sm mt-2">
            Status:{" "}
            {s.pending === SubmissionStatus.WAITING
              ? "Waiting"
              : s.pending === SubmissionStatus.GRADING
                ? "Grading"
                : "Completed"}
          </div>

          <div className="text-sm">
            Passed: {s.passed === 1 ? "Yes" : s.passed === 0 ? "No" : "—"}
          </div>

          {isAdmin && (
            <button
              className="mt-2 text-sm underline"
              onClick={() =>
                setPending({ id: s.id, nextPassed: s.passed !== 1 })
              }
            >
              Toggle grade
            </button>
          )}
        </div>
      ))}

      {pending && (
        <ConfirmActionModal
          title="Change grade"
          description={`Change submission #${pending.id}?`}
          confirmLabel="Confirm"
          danger={!pending.nextPassed}
          onCancel={() => setPending(null)}
          onConfirm={async () => {
            await gradeSubmissionClient(pending.id, pending.nextPassed);
            setPending(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
