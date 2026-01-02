import {
  addUsersAction,
  deleteUserAction,
  gradeSubmissionAction,
  gradeUserAction,
  promoteUserAction,
} from "./users";

export async function promoteUserClient(userId: string, admin: boolean) {
  await promoteUserAction(userId, admin);
}

export async function deleteUserClient(userId: string) {
  await deleteUserAction(userId);
}

export async function gradeUserClient(userId: string, passed: boolean) {
  await gradeUserAction(userId, passed);
}

export async function gradeSubmissionClient(
  submissionId: number,
  passed: boolean,
) {
  await gradeSubmissionAction(submissionId, passed);
}

export async function addUsersClient(emails: string[]) {
  await addUsersAction(emails);
}
