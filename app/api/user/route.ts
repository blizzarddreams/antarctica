import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { OPTIONS } from "../auth/[...nextauth]/route";

export async function GET(request: Request, response: Response) {
  console.log("k");
  const session = await getServerSession(OPTIONS);
  console.log("okk");
  if (session) {
    console.log("ok");
    const prisma = new PrismaClient();
    const email = session.user?.email;
    console.log(email);
    if (email) {
      const user = await prisma.user.findFirst({ where: { email } });
      return NextResponse.json({ user: user });
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
      console.log(data);
      const user = await prisma.user.update({
        where: { email },
        data: {
          ...data,
        },
      });
      return NextResponse.json({});
    }
  }
}
