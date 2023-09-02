import { getServerSession } from "next-auth/next";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { PusherServer } from "@/pusher";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

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

export async function DELETE(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const data = await request.json();
  if (session) {
    const prisma = new PrismaClient();
    const email = session.user?.email;
    if (email) {
      console.log(data);
      console.log(email);
      const post = await prisma.post.findFirst({
        where: {
          author: {
            email: email,
          },
          id: data.id,
        },
        include: {
          author: {
            include: {
              followers: {
                include: {
                  follower: true,
                },
              },
            },
          },
        },
      });
      await prisma.post.delete({ where: { id: post.id } });
      PusherServer.trigger(
        `profile-${post.author.username}`,
        "delete message",
        {
          post: post,
        },
      );
      post.author.followers.forEach((follower) => {
        const email_ = follower.follower.email;
        PusherServer.trigger(`dashboard-${email_}`, "delete message", {
          post: post,
        });
      });
      // send to self
      PusherServer.trigger(`dashboard-${post.author.email}`, "delete message", {
        post: post,
      });
      return NextResponse.json({ post });
    }
  }
}
export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  if (session) {
    const prisma = new PrismaClient();
    const email = session.user?.email;
    const data = await request.formData();
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
        let post;
        if (data.get("image")) {
          const image = data.get("image");
          const arrayBuffer = await (image as Blob).arrayBuffer();
          const uuid = `${uuidv4()}.png`;
          fs.writeFileSync(
            `./public/uploads/${uuid}`,
            Buffer.from(arrayBuffer),
          );
          post = await prisma.post.create({
            data: {
              content: data.get("post") as string,
              image: uuid,
              author: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        } else {
          post = await prisma.post.create({
            data: {
              content: data.get("post") as string,
              author: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        }
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
          PusherServer.trigger(`dashboard-${email_}`, "new message", {
            post: post_,
          });
        });
        // send to self
        PusherServer.trigger(`dashboard-${user.email}`, "new message", {
          post: post_,
        });
        return NextResponse.json({});
      } else {
        return NextResponse.json({ error: "error" });
      }
    } else {
      return NextResponse.json({ error: "error" });
    }
  }
}
