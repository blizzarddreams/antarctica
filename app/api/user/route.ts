import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { OPTIONS } from "../auth/[...nextauth]/route";
import prisma from "@/prisma";
import upload from "@/upload";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session) {
    const email = session.user?.email;
    if (email) {
      const user = await prisma.user.findFirst({
        where: { email },
        include: {
          posts: true,
          _count: { select: { notifications: { where: { read: false } } } },
        },
      });
      return NextResponse.json({ user });
    }
  }
}

export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session) {
    const email = session.user?.email;
    if (email) {
      const data = await request.formData();
      let dataToSave = {
        username: data.get("username") as string,
        description: data.get("description") as string,
        displayname: data.get("displayname") as string,
      };
      if (data.get("avatar")) {
        const avatar = data.get("avatar") as string;
        const buffer = Buffer.from(
          avatar.replace(/^data:image\/\w+;base64,/, ""),
          "base64",
        );
        const uuid = await upload(buffer, "avatars");

        (dataToSave as any).avatar = uuid;
      }
      if (data.get("banner")) {
        const banner = data.get("banner") as string;
        const buffer = Buffer.from(
          banner.replace(/^data:image\/\w+;base64,/, ""),
          "base64",
        );
        const uuid = await upload(buffer, "banners");

        (dataToSave as any).banner = uuid;
      }
      try {
        const user = await prisma.user.update({
          where: { email },
          data: { ...dataToSave },
        });
        return NextResponse.json({ user });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            return NextResponse.json({
              error: true,
              errorMessage: "username taken",
            });
          }
        }
      }
    }
  }
}
