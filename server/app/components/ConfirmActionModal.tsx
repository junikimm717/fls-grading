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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[420px]">
        <h2 className="font-semibold text-lg mb-2">{title}</h2>

        <div className="mb-4 text-sm text-gray-700">
          {description}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={pending}
            className="px-3 py-1 border rounded"
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
            className={`px-3 py-1 rounded text-white ${
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
