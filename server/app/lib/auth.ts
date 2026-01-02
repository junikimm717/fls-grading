import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DICTATOR } from "./env";
import { db } from "../db";
import { usersTable, accountsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  adapter: DrizzleAdapter(db, {
    usersTable,
    accountsTable,
  }),

  providers: [Google],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    async signIn({ user }) {
      const email = user.email;
      if (!email) return "/?notallowed=true";
      if (email === DICTATOR) return true;
      // dictator logic
      const query = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);
      return query.length > 0 ? true : "/?notallowed=true";
    },
  },
});
