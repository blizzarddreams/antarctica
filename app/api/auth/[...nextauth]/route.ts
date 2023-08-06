import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import GithubHandler from "next-auth/providers/github";

const prisma = new PrismaClient();

export const OPTIONS = {
  providers: [
    GithubHandler({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log(profile);
      /* const upsertUser = await prisma.user.upsert({
        where: { email: profile.email },
        update: {},
        create: {
          email: profile.email,
          username: profile.login,
          sessionId: profile.id,
        },
      });*/
      return true;
    },
  },
};

const handler = NextAuth(OPTIONS);

export { handler as GET, handler as POST };
