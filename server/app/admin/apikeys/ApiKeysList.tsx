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

  // State to track if the creation modal is open
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string | null;
  } | null>(null);

  function handleRevoke(id: string) {
    startTransition(async () => {
      await revokeApiKeyClient(id);
      // It is generally better to use router.refresh() than a full reload 
      // if your server component is fetching the keys.
      router.refresh();
      setRevokeTarget(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Worker API Keys</h1>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
        >
          Create API Key
        </button>
      </div>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Key</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b">
                <td className="px-3 py-2 font-medium">
                  {k.name || <span className="text-gray-400 italic">No name</span>}
                </td>
                <td className="px-3 py-2 font-mono text-gray-500">
                  ak_********
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
                  No active worker API keys
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

      {/* Logic moved into this Modal */}
      {isCreateModalOpen && (
        <CreateApiKeyModal
          onClose={() => {
            setIsCreateModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* =========================
   Create API Key Modal (Step 1: Name, Step 2: Show Key)
   ========================= */

function CreateApiKeyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    try {
      // Pass the name to your client helper
      const key = await createApiKeyClient(name);
      setGeneratedKey(key);
    } catch (error) {
      console.error("Failed to create key", error);
    } finally {
      setIsCreating(false);
    }
  }

  async function copy() {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
        {!generatedKey ? (
          /* Step 1: Form to enter name */
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-lg font-semibold">Create New API Key</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Key Name</label>
              <input
                autoFocus
                required
                type="text"
                placeholder="e.g. Production Environment"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Key"}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Success and Show Key */
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-green-700">Key Created Successfully</h2>
            <p className="text-sm text-red-600">
              This API key will <strong>never be shown again</strong>. 
              Copy it now and store it securely.
            </p>

            <div className="rounded border bg-gray-50 p-3 font-mono break-all text-sm">
              {generatedKey}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={copy}
                className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>

              <button
                onClick={onClose}
                className="rounded bg-black px-4 py-2 text-sm text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
