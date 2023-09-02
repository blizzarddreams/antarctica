import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get("skip")!);
  const prisma = new PrismaClient();
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        include: {
          followers: true,
          following: true,
        },
      },
      likes: true,
      reposts: true,
      reply: {
        include: {
          author: true,
        },
      },
      replies: {
        include: {
          author: true,
          likes: true,
          reposts: true,
        },
      },
    },
    skip: skip * 10,
    take: 10,
  });
  if (posts.length <= 9) {
    return NextResponse.json({ posts, noMore: true });
  } else {
    return NextResponse.json({ posts });
  }
}
