// @ts-nocheck

import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import prisma from "@/prisma";

export const OPTIONS = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const user_ = await prisma.user.findFirst({
        where: { email: profile.email },
      });
      if (!user_) {
        await prisma.user.upsert({
          where: { email: profile.email },
          update: {},
          create: {
            email: profile.email,
            username: profile.login,
          },
        });
      }
      return true;
    },
  },
};

const handler = NextAuth(OPTIONS);

export { handler as GET, handler as POST };
