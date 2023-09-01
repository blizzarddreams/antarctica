import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { OPTIONS } from "../auth/[...nextauth]/route";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);
  if (session) {
    const prisma = new PrismaClient();
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
    const prisma = new PrismaClient();
    const email = session.user?.email;
    if (email) {
      const data = await request.json();
      let dataToSave = {
        username: data.username,
        description: data.description,
        displayname: data.displayname,
      };

      if (data.newAvatar) {
        let dataImage = data.newAvatar.replace(/^data:image\/\w+;base64,/, "");
        let uuid = `${uuidv4()}.png`;
        fs.writeFileSync(
          `./public/avatars/${uuid}`,
          Buffer.from(dataImage, "base64"),
        );
        (dataToSave as any).avatar = uuid;
      }

      if (data.newBanner) {
        let dataImage = data.newBanner.replace(/^data:image\/\w+;base64,/, "");
        let uuid = `${uuidv4()}.png`;
        fs.writeFileSync(
          `./public/avatars/${uuid}`,
          Buffer.from(dataImage, "base64"),
        );
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
