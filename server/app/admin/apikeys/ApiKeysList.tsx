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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Worker API Keys</h1>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-2 px-4 text-white bg-black transition-colors hover:bg-gray-800"
        >
          Create API Key
        </button>
      </div>

      <div className="border">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">Key</th>
              <th className="py-2 px-3 text-left">Created</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t">
                <td className="py-2 px-3 font-medium">
                  {k.name || (
                    <span className="italic text-gray-400">No name</span>
                  )}
                </td>
                <td className="py-2 px-3 font-mono text-gray-500">
                  ak_********
                </td>
                <td className="py-2 px-3">{k.createdAt.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => setRevokeTarget({ id: k.id, name: k.name })}
                    className="text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}

            {keys.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 px-3 text-center text-gray-500">
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
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/40">
      <div className="p-6 w-full max-w-lg bg-white">
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
                className="py-2 px-3 w-full text-sm border focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 text-sm font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="py-2 px-4 text-sm text-white bg-black hover:bg-gray-800 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Key"}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Success and Show Key */
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-green-700">
              Key Created Successfully
            </h2>
            <p className="text-sm text-red-600">
              This API key will <strong>never be shown again</strong>. Copy it
              now and store it securely.
            </p>

            <div className="p-3 font-mono text-sm break-all bg-gray-50 border">
              {generatedKey}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={copy}
                className="py-2 px-4 text-sm font-medium border hover:bg-gray-50"
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>

              <button
                onClick={onClose}
                className="py-2 px-4 text-sm text-white bg-black"
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
