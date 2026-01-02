import BatchAddUsers from "./BatchAddUsers";

export default function AddPage() {
  return (
    <>
      <h1 className="text-xl font-semibold mb-4">Batch add users</h1>

      <p className="text-sm text-gray-600 mb-6">
        Paste a list of emails (one per line or from a spreadsheet).
      </p>

      <BatchAddUsers />
    </>
  );
}
