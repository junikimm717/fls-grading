"use client";

import { useTransition } from "react";

type ConfirmActionModalProps = {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30">
      <div className="p-6 bg-white shadow-md w-[420px]">
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>

        <div className="mb-4 text-sm text-gray-700">{description}</div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={pending}
            className="py-1 px-3 border"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              startTransition(async () => {
                await onConfirm();
              })
            }
            disabled={pending}
            className={`px-3 py-1  text-white ${
              danger ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
