import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const prisma = new PrismaClient();
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id")!);

  if (session?.user?.email) {
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
      include: {
        following: {
          select: {
            following: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
    const emails = user!.following.map((i) => i.following.email);
    const posts_ = await prisma.post.findMany({
      where: {
        OR: [
          { author: { email: session.user.email } },
          {
            author: { email: { in: emails } },
          },
        ],
      },
      include: {
        author: true,
        likes: true,
        reposts: true,
      },
    });

    const reposts_ = await prisma.repost.findMany({
      where: {
        OR: [
          { author: { email: session.user.email } },
          {
            author: { email: { in: emails } },
          },
        ],
      },
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
    });

    const reposts = reposts_.map((repost) => {
      repost.post.isRepost = true;
      repost.post.postCreatedAt = repost.post.createdAt;
      repost.post.createdAt = repost.createdAt;
      repost.post.repostAuthor = repost.author;
      return repost.post;
    });

    const posts = posts_
      .concat(...reposts)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ posts });
  }
}
