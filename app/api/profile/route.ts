import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { OPTIONS } from "../auth/[...nextauth]/route";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (username) {
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          include: { author: true, likes: true, reposts: true },
        },
        followers: true,
        following: true,
        reposts: {
          select: {
            author: true,
            createdAt: true,
            post: {
              include: {
                author: true,
                likes: true,
                reposts: true,
              },
            },
          },
        },
      },
    });
    const reposts = user?.reposts.map((repost) => {
      repost.post.isRepost = true;
      repost.post.postCreatedAt = repost.post.createdAt;
      repost.post.createdAt = repost.createdAt;
      repost.post.repostAuthor = repost.author;
      return repost.post;
    });
    const posts = user?.posts
      .concat(reposts)
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    user.posts = posts;
    return NextResponse.json({ user });
  }
}
