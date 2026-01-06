import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

  providers: [
    Credentials({
      id: "magic",
      name: "Magic Link",
      credentials: {
        userId: { type: "text" },
      },
      async authorize(credentials, req) {
        if (req.method !== "POST") {
          return null;
        }
        if (!credentials?.userId) {
          return null;
        }

        const userId =
          typeof credentials.userId === "string" ? credentials.userId : null;

        if (!userId) {
          return null;
        }

        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .limit(1);

        return user ?? null;
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // keep this — magic login still sets sub correctly
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
