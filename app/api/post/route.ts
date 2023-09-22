import { getServerSession } from "next-auth/next";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { PusherServer } from "@/pusher";
import prisma from "@/prisma";
import upload from "@/upload";
import redis from "@/redis";
import { zfd } from "zod-form-data";
import { ZodType, z } from "zod";

export async function GET(request: Request, response: Response) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const cache = await redis.get(`post-${id}`);
  if (cache) {
    return NextResponse.json({ post: JSON.parse(cache) });
  } else {
    const post = await prisma.post.findFirst({
      where: { id: parseInt(id!) },
      include: {
        author: true,
        likes: true,
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
            reply: {
              include: {
                author: true,
              },
            },
          },
        },
        reposts: true,
      },
    });
    redis.set(`post-${id}`, JSON.stringify(post));
    return NextResponse.json({ post });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const email = session.user?.email;
    const schema = zfd.formData({
      reply: zfd.text().optional(),
      content: zfd.text(),
      image: z.any().optional(),
    });
    const response = schema.safeParse(await request.formData());
    if (!response.success) {
      return NextResponse.json({ error: "zod errors" });
    }

    const { reply, content, image } = response.data;
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
      if (image) {
        const buffer = Buffer.from(await (image as Blob).arrayBuffer());
        const uuid = await upload(buffer, "uploads");
        if (reply) {
          const postToConnectTo = await prisma.post.findFirst({
            where: {
              id: parseInt(reply),
            },
          });
          if (postToConnectTo) {
            post = await prisma.post.create({
              data: {
                content: content,
                image: uuid,
                author: {
                  connect: {
                    id: user.id,
                  },
                },
                reply: {
                  connect: {
                    id: postToConnectTo.id,
                  },
                },
              },
            });
          }
        } else {
          post = await prisma.post.create({
            data: {
              content: content,
              image: uuid,
              author: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        }
      } else {
        if (reply) {
          const postToConnectTo = await prisma.post.findFirst({
            where: {
              id: parseInt(reply),
            },
          });
          if (postToConnectTo) {
            post = await prisma.post.create({
              data: {
                content: content,
                author: {
                  connect: {
                    id: user.id,
                  },
                },
                reply: {
                  connect: {
                    id: postToConnectTo.id,
                  },
                },
              },
            });
          }
        } else {
          post = await prisma.post.create({
            data: {
              content: content,
              author: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        }
      }
      let post_: any;
      if (post) {
        post_ = await prisma.post.findFirst({
          where: {
            id: post.id,
          },
          include: {
            author: true,
            likes: true,
            reposts: true,
            replies: true,
          },
        });
      }

      await PusherServer.trigger(`profile-${user.username}`, "new message", {
        post: post_,
      });
      user.followers.forEach(async (follower) => {
        const email_ = follower.follower.email;
        await PusherServer.trigger(`dashboard-${email_}`, "new message", {
          post: post_,
        });
      });
      // send to self
      await PusherServer.trigger(`dashboard-${user.email}`, "new message", {
        post: post_,
      });
      return NextResponse.json({ post });
    } else {
      return NextResponse.json({ error: "error" });
    }
  } else {
    return NextResponse.json({ error: "error" });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(OPTIONS);
  if (session) {
    const email = session.user?.email;
    const schema = z.object({
      id: z.number(),
    });
    const response = schema.safeParse(await request.json());
    if (!response.success) {
      return NextResponse.json({ error: "error" });
    }
    const { id } = response.data;
    if (email) {
      const post = await prisma.post.findFirst({
        where: {
          author: {
            email: email,
          },
          id,
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
      if (post) {
        await prisma.post.delete({ where: { id: post.id } });
        await redis.del(`post-${post.id}`);
        await PusherServer.trigger(
          `profile-${post.author.username}`,
          "delete message",
          {
            post: post,
          },
        );
        post.author.followers.forEach(async (follower) => {
          const email_ = follower.follower.email;
          await PusherServer.trigger(`dashboard-${email_}`, "delete message", {
            post: post,
          });
        });
        // send to self
        await PusherServer.trigger(
          `dashboard-${post.author.email}`,
          "delete message",
          {
            post: post,
          },
        );
        return NextResponse.json({ post });
      } else {
        return NextResponse.json({ error: "error" });
      }
    } else {
      return NextResponse.json({ error: "error" });
    }
  } else {
    return NextResponse.json({ error: "error" });
  }
}
