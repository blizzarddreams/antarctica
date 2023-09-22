import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  let search = searchParams
    .get("params")!
    .replace("%23", "#")
    .split(" ")
    .join(" & ");
  const skip = parseInt(searchParams.get("skip")!);
  if (search) {
    const posts = await prisma.post.findMany({
      where: {
        content: {
          search: search,
        },
      },
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
  } else {
    return NextResponse.json({ posts: [] });
  }
}
