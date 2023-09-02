import { getServerSession } from "next-auth";
import { OPTIONS } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get("skip")!);
  if (session) {
    const email = session.user?.email!;
    const bookmarks = await prisma.bookmark.findMany({
      where: { user: { email } },
      include: {
        post: {
          include: { author: true, likes: true, reposts: true },
        },
      },
      skip: skip * 10,
      take: 10,
    });

    if (bookmarks.length <= 9) {
      return NextResponse.json({ bookmarks, noMore: true });
    } else {
      return NextResponse.json({ bookmarks });
    }
  }
}
