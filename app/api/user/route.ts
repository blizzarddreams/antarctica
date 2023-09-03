import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { OPTIONS } from "../auth/[...nextauth]/route";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
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
        console.log(data.get("avatar"));
        const result = (await upload(data.get("avatar"), "avatars")) as string;

        (dataToSave as any).avatar = result;
      }
      if (data.get("banner")) {
        const result = (await upload(data.get("banner"), "banners")) as string;

        (dataToSave as any).banner = result;
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
