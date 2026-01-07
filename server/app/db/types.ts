export enum SubmissionStatus {
  WAITING = 0,
  GRADING = 1,
  COMPLETED = 2,
}
export type ResultWithReason = { ok: boolean; reason?: string };
