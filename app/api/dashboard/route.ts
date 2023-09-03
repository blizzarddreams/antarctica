import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id")!);
  const skip = parseInt(searchParams.get("skip")!);

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
            reply: true,
            replies: {
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

    const reposts = reposts_.map((repost) => {
      (repost.post as any).isRepost = true;
      (repost.post as any).postCreatedAt = repost.post.createdAt;
      (repost.post as any).createdAt = repost.createdAt;
      (repost.post as any).repostAuthor = repost.author;
      return repost.post;
    });

    const posts__ = posts_
      .concat(...(reposts as any)) // TODO: fix this
      .sort(
        (a, b) =>
          (new Date(b.createdAt) as any) - (new Date(a.createdAt) as any),
      );

    // take skip
    const posts = posts__.slice(skip * 10, skip * 10 + 10);
    if (posts.length <= 9) {
      return NextResponse.json({ posts, noMore: true });
    } else {
      return NextResponse.json({ posts });
    }
  }
}
