import {
  int,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { AdapterAccountType } from "next-auth/adapters";
import { SubmissionStatus } from "./types";

export const usersTable = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text().notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),

  passed: int(),
  admin: int().notNull().default(0),
  preferredArch: text("preferredArch"), // we should just store either "aarch64" or "x86_64"

  createdAt: integer("createdAt", {
    mode: "timestamp_ms",
  })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updatedAt", {
    mode: "timestamp_ms",
  })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const submissionTable = sqliteTable("submission", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  tarball: text(), // name of the tarball (we'll probably rename the tarball)
  logs: text(), // where the log file is (uploaded by admin only)
  passed: int(), // did the submission clear the tests (admin only)?
  arch: text().notNull(), // is it x86_64 or aarch64?
  pending: int().notNull().default(SubmissionStatus.WAITING),

  createdAt: integer("createdAt", {
    mode: "timestamp_ms",
  }).notNull(),
});

export const apiKeyTable = sqliteTable("api_key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  hash: text().notNull().unique(),
  name: text(),
  revokedAt: integer("revoked_at"),
  createdAt: integer("createdAt", {
    mode: "timestamp_ms",
  }).notNull(),
});

// ripped from auth.js
export const accountsTable = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);
