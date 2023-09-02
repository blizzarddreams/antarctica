import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const { searchParams } = new URL(request.url);

  const postId = searchParams.get("post_id")!;
  if (session) {
    const email = session.user?.email!;
    const user = await prisma.user.findFirst({
      where: { email },
      include: { likes: true },
    });
    const post = await prisma.post.findFirst({
      where: { id: parseInt(postId) },
      include: { likes: true },
    });
    if (user && post) {
      const userLikeIds = user?.likes.map((like) => like.id);
      const postLikeIds = post.likes.map((like) => like.id);

      const includes = userLikeIds.filter((id) => postLikeIds.includes(id));
      if (includes.length > 0) {
        // like exists
        return NextResponse.json({ liked: true });
      } else {
        return NextResponse.json({ liked: false });
      }
    }
  }
}

export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session) {
    const email = session.user?.email!;
    const data = await request.json();
    const user = await prisma.user.findFirst({ where: { email } });
    const post = await prisma.post.findFirst({
      where: { id: data.id },
      include: { author: true },
    });

    if (user && post) {
      const like = await prisma.like.findFirst({
        where: { author: { id: user.id }, post: { id: post.id } },
      });

      if (like) {
        await prisma.like.delete({ where: { id: like.id } });
        return NextResponse.json({ liked: false });
      } else {
        await prisma.like.create({
          data: {
            post: {
              connect: {
                id: post.id,
              },
            },
            author: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        await prisma.notification.create({
          data: {
            type: "LIKE",
            to: {
              connect: {
                id: post.author.id,
              },
            },
            from: {
              connect: {
                id: user.id,
              },
            },
            post: {
              connect: {
                id: post.id,
              },
            },
          },
        });
        return NextResponse.json({ liked: true });
      }
    }
  }
}
