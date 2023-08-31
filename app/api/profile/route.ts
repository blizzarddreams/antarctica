import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { OPTIONS } from "../auth/[...nextauth]/route";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")!;
  const prisma = new PrismaClient();
  if (username && searchParams.get("skip")) {
    const skip = parseInt(searchParams.get("skip")!);
    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        posts: {
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
          },
        },
        followers: true,
        following: true,
        reposts: {
          select: {
            author: true,
            createdAt: true,
            post: {
              include: {
                author: {
                  include: {
                    followers: true,
                    following: true,
                  },
                },
                likes: true,
                reposts: true,
              },
            },
          },
        },
      },
    });
    if (user) {
      const reposts = user?.reposts.map((repost) => {
        (repost.post as any).isRepost = true;
        (repost.post as any).postCreatedAt = repost.post.createdAt;
        (repost.post as any).createdAt = repost.createdAt;
        (repost.post as any).repostAuthor = repost.author;
        return repost.post;
      });
      const posts = user.posts
        .concat(reposts)
        .flat()
        .sort(
          (a, b) =>
            (new Date(b.createdAt) as any) - (new Date(a.createdAt) as any),
        );
      user.posts = posts.slice(skip * 10, skip * 10 + 10);

      return NextResponse.json({ user });
    }
  } else if (username) {
    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        followers: true,
        following: true,
      },
    });
    return NextResponse.json({ user });
  }
}
