"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addUsersClient } from "@/app/lib/users-client";
import { ConfirmActionModal } from "@/app/components/ConfirmActionModal";

export default function BatchAddUsers() {
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const [raw, setRaw] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  function parseEmails(input: string) {
    return Array.from(
      new Set(
        input
          .split(/[\s,;]+/)
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0),
      ),
    );
  }

  function onPreview() {
    setEmails(parseEmails(raw));
    setShowConfirm(true);
  }

  return (
    <>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={10}
        placeholder={`alice@mit.edu
bob@mit.edu
carol@mit.edu`}
        className="w-full border rounded p-2 font-mono mb-4"
      />

      <div className="flex justify-end">
        <button
          onClick={onPreview}
          disabled={raw.trim().length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Preview & Add
        </button>
      </div>

      {showConfirm && (
        <ConfirmActionModal
          title="Confirm user creation"
          description={
            <div className="max-h-48 overflow-auto text-sm">
              <p className="mb-2">
                You are about to add <b>{emails.length}</b> users:
              </p>

              <ul className="list-disc list-inside font-mono">
                {emails.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          }
          confirmLabel="Add users"
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            startTransition(async () => {
              await addUsersClient(emails);
              setShowConfirm(false);
              setRaw("");
              router.refresh();
            });
          }}
        />
      )}
    </>
  );
}
