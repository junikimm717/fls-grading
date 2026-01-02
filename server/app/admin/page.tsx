import { db } from "@/app/db";
import { usersTable } from "@/app/db/schema";
import { isAdminQuery } from "@/app/lib/is-admin";
import { and, eq, like } from "drizzle-orm";
import UserSearch from "./UserSearch";
import UserPagination from "./UserPagination";
import UsersTable from "./UsersTable";

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    admin?: "admin" | "student";
    page?: string;
  }>;
}) {
  if (!(await isAdminQuery())) throw new Error("Unauthorized");

  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];

  if (params.email) {
    conditions.push(like(usersTable.email, `${params.email}%`));
  }

  if (params.admin === "admin") {
    conditions.push(eq(usersTable.admin, 1));
  }

  if (params.admin === "student") {
    conditions.push(eq(usersTable.admin, 0));
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(PAGE_SIZE + 1)
    .offset(offset);

  return (
    <>
      <UserSearch />

      <UsersTable users={users.slice(0, PAGE_SIZE)} />

      <UserPagination
        page={page}
        hasNext={users.length > PAGE_SIZE}
      />
    </>
  );
}
