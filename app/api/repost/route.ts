import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { z } from "zod";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const { searchParams } = new URL(request.url);

  const postId = searchParams.get("post_id")!;
  if (session) {
    const email = session.user?.email!;
    const user = await prisma.user.findFirst({
      where: { email },
      include: { reposts: true },
    });
    const post = await prisma.post.findFirst({
      where: { id: parseInt(postId) },
      include: { reposts: true, author: true },
    });
    if (user && post) {
      const userRepostIds = user?.reposts.map((repost) => repost.id);
      const postRepostIds = post.reposts.map((repost) => repost.id);

      const includes = userRepostIds.filter((id) => postRepostIds.includes(id));
      if (includes.length > 0) {
        // repost exists
        return NextResponse.json({ reposted: true });
      } else {
        return NextResponse.json({ reposted: false });
      }
    }
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(OPTIONS);
  if (session) {
    const email = session.user?.email!;
    const schema = z.object({
      id: z.number(),
    });
    const response = schema.safeParse(request.body);
    if (!response.success) {
      return NextResponse.json({ error: "error" });
    }
    const { id } = response.data;
    const user = await prisma.user.findFirst({ where: { email } });
    const post = await prisma.post.findFirst({
      where: { id },
      include: { author: true },
    });

    if (user && post) {
      const repost = await prisma.repost.findFirst({
        where: { author: { id: user.id }, post: { id: post.id } },
      });

      if (repost) {
        await prisma.repost.delete({ where: { id: repost.id } });
        return NextResponse.json({ reposted: false });
      } else {
        await prisma.repost.create({
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
            type: "REPOST",
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
        return NextResponse.json({ reposted: true });
      }
    }
  }
}
