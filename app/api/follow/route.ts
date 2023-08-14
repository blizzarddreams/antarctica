import { getServerSession } from "next-auth/next";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const prisma = new PrismaClient();
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id")!);
  if (session && session.user && session.user.email) {
    const follower = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    const following = await prisma.user.findFirst({
      where: { id },
    });
    if (follower && following) {
      if (follower.id === following.id) {
        return NextResponse.json({
          error: true,
          errorMessage: "can't follow yourself",
        });
      }
      const follow = await prisma.follow.findFirst({
        where: {
          follower: {
            id: follower.id,
          },
          following: {
            id: following.id,
          },
        },
      });
      if (follow) {
        return NextResponse.json({ following: true });
      } else {
        return NextResponse.json({ following: false });
      }
    } else {
      return NextResponse.json({
        error: true,
        errorMesage: "users don't exist",
      });
    }
  } else {
    return NextResponse.json({
      error: true,
      errorMessage: "not logged in",
    });
  }
}

export async function POST(request: Request, response: Response) {
  const prisma = new PrismaClient();
  const session = await getServerSession(OPTIONS);

  if (session && session.user && session.user.email) {
    const data = await request.json();

    const follower = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    const following = await prisma.user.findFirst({
      where: { id: data.following },
    });

    if (follower && following) {
      if (follower.id === following.id) {
        return NextResponse.json({
          error: true,
          errorMessage: "can't follow yourself",
        });
      }

      const follow = await prisma.follow.findFirst({
        where: {
          follower: {
            id: follower.id,
          },
          following: {
            id: following.id,
          },
        },
      });
      if (follow) {
        await prisma.follow.delete({
          where: {
            id: follow.id,
          },
        });
        return NextResponse.json({ following: false });
      } else {
        await prisma.follow.create({
          data: {
            follower: {
              connect: {
                id: follower.id,
              },
            },
            following: {
              connect: {
                id: following.id,
              },
            },
          },
        });
        await prisma.notification.create({
          data: {
            type: "FOLLOW",
            to: {
              connect: {
                id: following.id,
              },
            },
            from: {
              connect: {
                id: follower.id,
              },
            },
          },
        });
        return NextResponse.json({ following: true });
      }
    }
  }
}
