"use client";

import { SubmissionRow } from "./types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmActionModal } from "@/app/components/ConfirmActionModal";
import { gradeSubmissionClient } from "@/app/lib/users-client";
import RenderStatus from "./RenderStatus";
import Link from "next/link";

export function SubmissionCards({
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
      {submissions.map((s) => (
        <div key={s.id} className="p-3 bg-white border">
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
          <div className="mt-2 text-sm">
            <strong>Creator:</strong>
            <span className="p-2 font-mono max-w-[8rem] truncate" title={s.userEmail}>
              {isAdmin ? (
                <Link className="underline" href={`/admin/users/${s.userId}`}>
                  {s.userEmail}
                </Link>
              ) : (
                <>{s.userEmail}</>
              )}
            </span>
          </div>

          <div className="mt-2 text-sm">
            <strong>Status:</strong>{" "}
            <RenderStatus status={s.pending} passed={s.passed} />
          </div>
          <div className="mt-2 text-sm">
            <strong>Architecture:</strong> {s.arch}
          </div>

          {isAdmin && (
            <div className="mt-2 text-sm">
              <button
                className="mx-1 text-sm text-green-700 underline"
                onClick={() =>
                  setPendingAction({
                    id: s.id,
                    nextPassed: true,
                  })
                }
              >
                Pass
              </button>
              <button
                className="mx-1 text-sm text-red-700 underline"
                onClick={() =>
                  setPendingAction({
                    id: s.id,
                    nextPassed: false,
                  })
                }
              >
                Fail
              </button>
            </div>
          )}
        </div>
      ))}

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
          danger
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
