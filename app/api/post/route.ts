import { getServerSession } from "next-auth/next";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { PusherServer } from "@/pusher";

export async function GET(request: Request, response: Response) {
  const prisma = new PrismaClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const post = await prisma.post.findFirst({
    where: { id: parseInt(id!) },
    include: { author: true, likes: true, reposts: true },
  });
  return NextResponse.json({ post });
}
export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  if (session) {
    const prisma = new PrismaClient();
    const email = session.user?.email;
    const data = await request.json();
    if (email) {
      const user = await prisma.user.findFirst({
        where: { email },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
        },
      });
      if (user) {
        const post = await prisma.post.create({
          data: {
            content: data.post,
            author: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        const post_ = await prisma.post.findFirst({
          where: {
            id: post.id,
          },
          include: {
            author: true,
            likes: true,
            reposts: true,
          },
        });
        PusherServer.trigger(`profile-${user.username}`, "new message", {
          post: post_,
        });
        user.followers.forEach((follower) => {
          const email_ = follower.follower.email;
          console.log(email_);
          PusherServer.trigger(`dashboard-${email_}`, "new message", {
            post: post_,
          });
        });
        // send to self
        PusherServer.trigger(`dashboard-${user.email}`, "new message", {
          post: post_,
        });
        console.log("sent");
        return NextResponse.json({});
      } else {
        return NextResponse.json({ error: "error" });
      }
    } else {
      return NextResponse.json({ error: "error" });
    }
  }
}
