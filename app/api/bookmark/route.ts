import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const session = await getServerSession(OPTIONS);
  const { searchParams } = new URL(request.url);

  const postId = searchParams.get("post_id")!;
  if (session) {
    const email = session.user?.email!;
    const user = await prisma.user.findFirst({
      where: { email },
      include: { bookmarks: true },
    });
    const post = await prisma.post.findFirst({
      where: { id: parseInt(postId) },
      include: { bookmarks: true },
    });
    if (user && post) {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          user: {
            id: user.id,
          },
          post: {
            id: post.id,
          },
        },
      });
      if (bookmark) {
        return NextResponse.json({ bookmarked: true });
      } else {
        return NextResponse.json({ bookmarked: false });
      }
    } else {
      return NextResponse.json({ bookmarked: false });
    }
  } else {
    return NextResponse.json({ bookmarked: false });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(OPTIONS);
  const schema = z.object({
    id: z.number(),
  });
  const response = schema.safeParse(await request.json());
  if (!response.success) {
    return NextResponse.json({ error: "error" });
  }
  const email = session!.user!.email!;
  const { id } = response.data;
  const user = await prisma.user.findFirst({ where: { email } });
  const post = await prisma.post.findFirst({
    where: { id },
    include: { author: true },
  });

  if (user && post) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        user: {
          id: user.id,
        },
        post: {
          id: post.id,
        },
      },
    });

    if (bookmark) {
      await prisma.bookmark.delete({ where: { id: bookmark.id } });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: {
          post: {
            connect: {
              id: post.id,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return NextResponse.json({ bookmarked: true });
    }
  } else {
    return NextResponse.json({ error: true });
  }
}
