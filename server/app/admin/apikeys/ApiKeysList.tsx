"use client";

import { useState, useTransition } from "react";

import {
  createApiKeyClient,
  revokeApiKeyClient,
} from "@/app/lib/apikey-client";
import { ConfirmActionModal } from "@/app/components/ConfirmActionModal";
import { useRouter } from "next/navigation";

/* =========================
   Types
   ========================= */

export type ApiKeyRow = {
  id: string;
  name: string | null;
  createdAt: Date;
  email: string;
};

/* =========================
   Main Component
   ========================= */

export function ApiKeysList({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [newKey, setNewKey] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string | null;
  } | null>(null);


  function handleCreate() {
    startTransition(async () => {
      const key = await createApiKeyClient();
      setNewKey(key);
      router.refresh();
    });
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      await revokeApiKeyClient(id);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">API Keys</h1>

        <button
          onClick={handleCreate}
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Create API Key
        </button>
      </div>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Key</th>
              <th className="px-3 py-2 text-left">Owner</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b">
                <td className="px-3 py-2 font-mono">
                  ak_********
                </td>
                <td className="px-3 py-2 font-mono">
                  {k.email}
                </td>
                <td className="px-3 py-2">
                  {k.createdAt.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() =>
                      setRevokeTarget({ id: k.id, name: k.name })
                    }
                    className="text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}

            {keys.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  No active API keys
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Revoke confirmation */}
      {revokeTarget && (
        <ConfirmActionModal
          title="Revoke API Key"
          description={`Are you sure you want to revoke this API key${
            revokeTarget.name ? ` (“${revokeTarget.name}”)` : ""
          }? This action cannot be undone.`}
          confirmLabel="Revoke"
          onCancel={() => setRevokeTarget(null)}
          onConfirm={async () => handleRevoke(revokeTarget.id)}
        />
      )}

      {/* One-time API key modal */}
      {newKey && (
        <ApiKeyOnceModal
          apiKey={newKey}
          onClose={() => setNewKey(null)}
        />
      )}
    </div>
  );
}

/* =========================
   One-Time Key Modal
   ========================= */

function ApiKeyOnceModal({
  apiKey,
  onClose,
}: {
  apiKey: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">New API Key</h2>

        <p className="text-sm text-red-600">
          This API key will <strong>never be shown again</strong>.
          Copy it now and store it securely.
        </p>

        <div className="rounded border bg-gray-50 p-3 font-mono break-all">
          {apiKey}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={copy}
            className="rounded border px-3 py-1 text-sm"
          >
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={onClose}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
