"use client";

import { User } from "./UsersTable";

type Props = {
  user: User;
  isSelf: boolean;
  disabled: boolean;
  onToggleAdminAction: () => void;
  onTogglePassedAction: () => void;
  onDeleteAction: () => void;
};

export function UserCard({
  user,
  isSelf,
  disabled,
  onToggleAdminAction,
  onTogglePassedAction,
  onDeleteAction,
}: Props) {
  return (
    <div className="p-4 space-y-3 bg-white border">
      <div className="font-mono text-sm break-all">{user.email}</div>

      <div className="flex justify-between text-sm">
        <span>Staff</span>
        <button
          disabled={disabled}
          className="underline"
          onClick={onToggleAdminAction}
        >
          {user.admin ? "Yes" : "No"}
        </button>
      </div>

      <div className="flex justify-between text-sm">
        <span>Passed</span>
        <button
          disabled={disabled}
          className="underline"
          onClick={onTogglePassedAction}
        >
          {user.passed === null ? "—" : user.passed === 1 ? "Yes" : "No"}
        </button>
      </div>

      {!isSelf && (
        <button
          className="text-sm text-red-600 underline"
          onClick={onDeleteAction}
        >
          Delete
        </button>
      )}
    </div>
  );
}
