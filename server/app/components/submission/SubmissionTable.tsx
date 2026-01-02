"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmissionRow } from "./types";
import { ConfirmActionModal } from "@/app/components/ConfirmActionModal";
import { gradeSubmissionClient } from "@/app/lib/users-client";
import { SubmissionStatus } from "@/app/db/types";

export function SubmissionTable({
  submissions,
  isAdmin,
}: {
  submissions: SubmissionRow[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<{
    id: number;
    nextPassed: boolean;
  } | null>(null);

  return (
    <>
      <table className="w-full border rounded">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Created</th>
            <th className="p-2">Status</th>
            <th className="p-2">Passed</th>
            {isAdmin && <th className="p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">
                <a
                  href={`/portal/submission/${s.id}`}
                  className="text-blue-600 underline"
                >
                  #{s.id}
                </a>
              </td>

              <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>

              <td className="p-2">
                {s.pending === SubmissionStatus.WAITING
                  ? "Waiting"
                  : s.pending === SubmissionStatus.GRADING
                    ? "Grading"
                    : "Completed"}
              </td>

              <td className="p-2">
                {s.passed === 1 ? "Yes" : s.passed === 0 ? "No" : "—"}
              </td>

              {isAdmin && (
                <td className="p-2">
                  <button
                    className="text-sm underline"
                    onClick={() =>
                      setPendingAction({
                        id: s.id,
                        nextPassed: s.passed !== 1,
                      })
                    }
                  >
                    Toggle
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pendingAction && (
        <ConfirmActionModal
          title="Manually change grade"
          description={
            <>
              Are you sure you want to mark submission{" "}
              <strong>#{pendingAction.id}</strong> as{" "}
              <strong>{pendingAction.nextPassed ? "PASSED" : "FAILED"}</strong>?
            </>
          }
          confirmLabel="Confirm"
          danger={!pendingAction.nextPassed}
          onCancel={() => setPendingAction(null)}
          onConfirm={async () => {
            await gradeSubmissionClient(
              pendingAction.id,
              pendingAction.nextPassed,
            );
            setPendingAction(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
