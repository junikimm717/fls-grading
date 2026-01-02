"use client";

import { useEffect } from "react";

export default function SubmitError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Optional: log unexpected errors
    if (error.name !== "SubmissionError") {
      console.error(error);
    }
  }, [error]);

  if (error.name === "SubmissionError") {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="border rounded bg-red-50 p-4 space-y-3">
          <div className="font-medium text-red-700">
            Submission failed
          </div>
          <div className="text-sm text-red-600">
            {error.message}
          </div>
          <button
            onClick={reset}
            className="mt-2 px-3 py-1.5 rounded bg-red-600 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // fallback for real bugs
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="font-semibold">Something went wrong</h2>
      <p className="text-sm text-gray-600">
        This looks like a server error. Please contact staff.
      </p>
    </div>
  );
}
