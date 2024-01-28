import { getServerSession } from "next-auth";
import { OPTIONS } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { z } from "zod";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  const user = await prisma.user.findFirst({
    where: {
      email: session!.user!.email!,
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

export async function POST(request: Request) {
  const session = await getServerSession(OPTIONS);
  if (session?.user?.email) {
    const schema = z.object({
      username: z.string(),
    });
    const response = schema.safeParse(await request.json());
    if (!response.success) {
      console.log(response.error);
      return NextResponse.json({ error: true });
    }
    const { username } = response.data;
    const userCreatingDirect = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });
    const userBeingDirectedAt = await prisma.user.findFirst({
      where: {
        username: username,
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
    } else {
      return NextResponse.json({ error: true });
    }
  } else {
    return NextResponse.json({ error: true });
  }
}
