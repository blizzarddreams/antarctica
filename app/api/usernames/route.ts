import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import upload from "@/upload";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  if (session?.user?.email) {
    const users = await prisma.user.findMany({
      select: {
        username: true,
      },
    });
    const usernames = users.map((username) => username.username);
    return NextResponse.json({ usernames });
  } else {
    return NextResponse.json({ error: true });
  }
}
