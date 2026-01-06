export type SubmissionRow = {
  id: number;
  createdAt: Date;
  passed: number | null;
  pending: number;
  arch: string
};

export type SubmissionView = {
  submission: {
    id: number;
    userId: string;
    tarball: string | null;
    logs: string | null;
    passed: number | null;
    arch: string;
    pending: number;
    createdAt: Date;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export class SubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubmissionError";
  }
}
