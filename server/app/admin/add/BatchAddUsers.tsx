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
        className="p-2 mb-4 w-full font-mono border"
      />

      <div className="flex justify-end">
        <button
          onClick={onPreview}
          disabled={raw.trim().length === 0}
          className="py-2 px-4 text-white bg-blue-600"
        >
          Preview & Add
        </button>
      </div>

      {showConfirm && (
        <ConfirmActionModal
          title="Confirm user creation"
          description={
            <div className="overflow-auto max-h-48 text-sm">
              <p className="mb-2">
                You are about to add <b>{emails.length}</b> users:
              </p>

              <ul className="font-mono list-disc list-inside">
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
