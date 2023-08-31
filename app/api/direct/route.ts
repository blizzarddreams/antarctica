import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const prisma = new PrismaClient();

    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
      include: {
        directs: {
          include: {
            members: true,
            messages: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ user });
  }
}

export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const prisma = new PrismaClient();
    const data = await request.json();

    const userCreatingDirect = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });
    const userBeingDirectedAt = await prisma.user.findFirst({
      where: {
        username: data.username,
      },
    });

    if (userCreatingDirect && userBeingDirectedAt) {
      const direct = await prisma.direct.findFirst({
        where: {
          AND: [
            {
              members: {
                some: {
                  username: userCreatingDirect.username,
                },
              },
            },
            {
              members: {
                some: {
                  username: userBeingDirectedAt.username,
                },
              },
            },
          ],
        },
      });
      if (direct) {
        return NextResponse.json({
          error: true,
          errorMessage: "direct already exists",
        });
      } else {
        await prisma.direct.create({
          data: {
            members: {
              connect: [
                { id: userBeingDirectedAt.id },
                { id: userCreatingDirect.id },
              ],
            },
          },
        });
        return NextResponse.json({ ok: "ok" });
      }
    }
  }
}
