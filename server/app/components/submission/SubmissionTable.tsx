"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmissionRow } from "./types";
import { ConfirmActionModal } from "@/app/components/ConfirmActionModal";
import { gradeSubmissionClient } from "@/app/lib/users-client";
import RenderStatus from "./RenderStatus";
import Link from "next/link";

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
      <table className="w-full border">
        <thead className="text-left bg-gray-50 border">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">User</th>
            <th className="p-2">Arch</th>
            <th className="p-2">Status</th>
            {isAdmin && <th className="p-2" />}
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">
                <Link
                  href={`/portal/submission/${s.id}`}
                  className="text-blue-600 underline"
                >
                  #{s.id}
                </Link>
              </td>

              <td
                className="p-2 font-mono max-w-[8rem] truncate"
                title={s.userEmail}
              >
                {isAdmin ? (
                  <Link className="underline" href={`/admin/users/${s.userId}`}>
                    {s.userEmail}
                  </Link>
                ) : (
                  <>{s.userEmail}</>
                )}
              </td>
              <td className="p-2">{s.arch}</td>

              <td className="p-2">
                <RenderStatus status={s.pending} passed={s.passed} />
              </td>

              {isAdmin && (
                <td className="p-2">
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
