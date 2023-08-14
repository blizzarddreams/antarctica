import { getServerSession } from "next-auth";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  console.log("ok");
  if (session?.user?.email) {
    const prisma = new PrismaClient();
    const data = await request.json();
    const directId = data.directId;
    const newMessage = data.message;

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    const direct = await prisma.direct.findFirst({
      where: {
        id: parseInt(directId),
        members: {
          some: {
            email: session.user.email,
          },
        },
      },
      include: {
        messages: true,
      },
    });
    if (direct && user) {
      const message = await prisma.directMessage.create({
        data: {
          content: newMessage,
          direct: {
            connect: {
              id: direct.id,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      await prisma.direct.update({
        where: {
          id: direct.id,
        },
        data: {
          messages: {
            set: [...direct.messages.concat([message])],
          },
        },
      });
      return NextResponse.json({ ok: "ok" });
    }
  }
}
