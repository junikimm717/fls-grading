import { SubmissionStatus } from "@/app/db/types";

const LoadingSpinner = ({ className = "w-4 h-4" }) => {
  return (
    <svg
      className={`animate-spin inline ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export function RenderWaiting() {
  return (
    <span className="text-gray-700 font-bold">
      Waiting
      <LoadingSpinner className="mx-2 w-4 h-4" />
    </span>
  );
}

export function RenderGrading() {
  return (
    <span className="text-yellow-500 font-bold">
      Grading
      <LoadingSpinner className="mx-2 w-4 h-4" />
    </span>
  );
}

export function RenderPassed() {
  return <span className="text-green-600 font-bold">Passed</span>;
}

export function RenderFailed() {
  return <span className="text-red-600 font-bold">Failed</span>;
}

export default function RenderStatus({
  status,
  passed,
}: {
  status: SubmissionStatus;
  passed: any;
}) {
  if (status === SubmissionStatus.WAITING) {
    return <RenderWaiting />;
  } else if (status === SubmissionStatus.GRADING) {
    return <RenderGrading />;
  } else if (!!passed) {
    return <RenderPassed />;
  } else {
    return <RenderFailed />;
  }
}
