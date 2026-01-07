"use client";

import Link from "next/link";
import { User } from "./UsersTable";

type Props = {
  user: User;
  isSelf: boolean;
  disabled: boolean;
  onToggleAdminAction: () => void;
  onTogglePassedAction: () => void;
  onDeleteAction: () => void;
};

export function UsersTableRow({
  user,
  isSelf,
  disabled,
  onToggleAdminAction,
  onTogglePassedAction,
  onDeleteAction,
}: Props) {
  return (
    <tr>
      <td className="py-2 px-3 font-mono truncate">
        <Link className="underline" href={`/admin/users/${user.id}`}>
          {user.email}
        </Link>
      </td>

      <td className="py-2 px-3 text-center">
        <button
          disabled={disabled}
          className="underline"
          onClick={onToggleAdminAction}
        >
          {user.admin ? "Yes" : "No"}
        </button>
      </td>

      <td className="py-2 px-3 text-center">
        <button
          disabled={disabled}
          className="underline"
          onClick={onTogglePassedAction}
        >
          {user.passed === null ? "—" : user.passed === 1 ? "Yes" : "No"}
        </button>
      </td>

      <td className="py-2 px-3 text-center">
        {!isSelf && (
          <button className="text-red-600 underline" onClick={onDeleteAction}>
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
