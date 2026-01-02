"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { promoteUserAction, gradeUserAction, deleteUserAction } from "@/app/lib/users";
import { ConfirmActionModal } from "@/app/components/ConfirmActionModal";
import { UserCard } from "./UserCard";
import { UsersTableRow } from "./UsersTableRow";

/* =========================
   Types
   ========================= */

export type User = {
  id: string;
  email: string;
  admin: number;
  passed: number | null;
};

type PendingAction =
  | { kind: "delete"; user: User }
  | { kind: "toggleAdmin"; user: User; nextAdmin: boolean }
  | { kind: "togglePassed"; user: User; nextPassed: boolean };

function nextPassedValue(u: User): boolean {
  return u.passed === null ? true : u.passed === 1 ? false : true;
}

/* =========================
   Component
   ========================= */

export default function UsersTable({ users }: { users: User[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] =
    useState<PendingAction | null>(null);

  function refresh() {
    router.refresh();
  }

  function confirm(action: PendingAction) {
    setPendingAction(action);
  }

  return (
    <>
      {/* ================= Desktop table ================= */}
      <div className="hidden md:block">
        <table className="w-full table-fixed border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-[40%] border px-3 py-2 text-left">
                Email
              </th>
              <th className="w-[15%] border px-3 py-2 text-center">
                Staff
              </th>
              <th className="w-[15%] border px-3 py-2 text-center">
                Passed
              </th>
              <th className="w-[30%] border px-3 py-2 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <UsersTableRow
                key={u.id}
                user={u}
                isSelf={u.id === session?.user?.id}
                disabled={pending}
                onToggleAdminAction={() =>
                  confirm({
                    kind: "toggleAdmin",
                    user: u,
                    nextAdmin: !u.admin,
                  })
                }
                onTogglePassedAction={() =>
                  confirm({
                    kind: "togglePassed",
                    user: u,
                    nextPassed: nextPassedValue(u),
                  })
                }
                onDeleteAction={() =>
                  confirm({ kind: "delete", user: u })
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= Mobile cards ================= */}
      <div className="md:hidden space-y-4">
        {users.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isSelf={u.id === session?.user?.id}
            disabled={pending}
            onToggleAdminAction={() =>
              confirm({
                kind: "toggleAdmin",
                user: u,
                nextAdmin: !u.admin,
              })
            }
            onTogglePassedAction={() =>
              confirm({
                kind: "togglePassed",
                user: u,
                nextPassed: nextPassedValue(u),
              })
            }
            onDeleteAction={() =>
              confirm({ kind: "delete", user: u })
            }
          />
        ))}
      </div>

      {/* ================= Confirmation modal ================= */}
      {pendingAction && (
        <ConfirmActionModal
          title={
            pendingAction.kind === "delete"
              ? "Delete user"
              : pendingAction.kind === "toggleAdmin"
              ? "Change staff status"
              : "Change pass status"
          }
          description={
            pendingAction.kind === "delete" ? (
              <>
                Delete{" "}
                <span className="font-mono">
                  {pendingAction.user.email}
                </span>
                ? <b>This cannot be undone.</b>
              </>
            ) : pendingAction.kind === "toggleAdmin" ? (
              <>
                {pendingAction.nextAdmin
                  ? "Promote"
                  : "Demote"}{" "}
                <span className="font-mono">
                  {pendingAction.user.email}
                </span>
                ?
              </>
            ) : (
              <>
                Mark{" "}
                <span className="font-mono">
                  {pendingAction.user.email}
                </span>{" "}
                as{" "}
                <b>
                  {pendingAction.nextPassed
                    ? "passed"
                    : "not passed"}
                </b>
                ?
              </>
            )
          }
          confirmLabel={
            pendingAction.kind === "delete"
              ? "Delete"
              : "Confirm"
          }
          danger={pendingAction.kind === "delete"}
          onCancel={() => setPendingAction(null)}
          onConfirm={async () => {
            startTransition(async () => {
              if (pendingAction.kind === "delete") {
                await deleteUserAction(pendingAction.user.id);
              } else if (pendingAction.kind === "toggleAdmin") {
                await promoteUserAction(
                  pendingAction.user.id,
                  pendingAction.nextAdmin,
                );
              } else {
                await gradeUserAction(
                  pendingAction.user.id,
                  pendingAction.nextPassed,
                );
              }

              setPendingAction(null);
              refresh();
            });
          }}
        />
      )}
    </>
  );
}
