"use server";

import { db } from "../db";
import { usersTable } from "../db/schema";

export async function exportRoster() {
  const roster = await db
    .select({
      email: usersTable.email,
      grade: usersTable.passed,
    })
    .from(usersTable);

  const data: { [key: string]: string } = {};

  roster.forEach((elt) => {
    data[elt.email] = elt.grade ? "P" : "F";
  });

  const json = JSON.stringify(data, null, 2);

  return json
}
