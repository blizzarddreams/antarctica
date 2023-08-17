import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { OPTIONS } from "../auth/[...nextauth]/route";
import fs from "fs";
import md5 from "md5";

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

      // check if username is taken

      if (data.newAvatar) {
        let dataImage = data.newAvatar.replace(/^data:image\/\w+;base64,/, "");
        let md5OfImage = `${md5(dataImage)}.png`;
        fs.writeFileSync(
          `./public/avatars/${md5OfImage}`,
          Buffer.from(dataImage, "base64"),
        );
        (dataToSave as any).avatar = md5OfImage;
      }

      if (data.newBanner) {
        let dataImage = data.newBanner.replace(/^data:image\/\w+;base64,/, "");
        let md5OfImage = `${md5(dataImage)}.png`;
        fs.writeFileSync(
          `./public/banners/${md5OfImage}`,
          Buffer.from(dataImage, "base64"),
        );
        (dataToSave as any).banner = md5OfImage;
      }
      try {
        const user = await prisma.user.update({
          where: { email },
          data: { ...dataToSave },
        });
        // if new avatar update it
        if (data.newAvatar) {
          let dataImage = data.newAvatar.replace(
            /^data:image\/\w+;base64,/,
            "",
          );
          let md5OfImage = `${md5(dataImage)}.png`;
          fs.writeFileSync(
            `./public/avatars/${md5OfImage}`,
            Buffer.from(dataImage, "base64"),
          );
        }
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
