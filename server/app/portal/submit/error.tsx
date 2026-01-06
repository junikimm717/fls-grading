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
      <div className="py-6 px-4 mx-auto max-w-xl">
        <div className="p-4 space-y-3 bg-red-50 border">
          <div className="font-medium text-red-700">Submission failed</div>
          <div className="text-sm text-red-600">{error.message}</div>
          <button
            onClick={reset}
            className="py-1.5 px-3 mt-2 text-white bg-red-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // fallback for real bugs
  return (
    <div className="py-6 px-4 mx-auto max-w-xl">
      <h2 className="font-semibold">Something went wrong</h2>
      <p className="text-sm text-gray-600">
        This looks like a server error. Please contact staff.
      </p>
    </div>
  );
}
