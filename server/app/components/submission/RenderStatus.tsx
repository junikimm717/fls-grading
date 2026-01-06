import { SubmissionStatus } from "@/app/db/types";
import LoadingSpinner from "../LoadingSpinner";

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
  passed: number | null;
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
