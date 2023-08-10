import { getServerSession } from "next-auth/next";
import { OPTIONS } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const prisma = new PrismaClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const post = await prisma.post.findFirst({
    where: { id: parseInt(id!) },
    include: { author: true },
  });
  return NextResponse.json({ post });
}
export async function POST(request: Request, response: Response) {
  const session = await getServerSession(OPTIONS);

  if (session) {
    const prisma = new PrismaClient();
    const email = session.user?.email;
    const data = await request.json();
    if (email) {
      const user = await prisma.user.findFirst({ where: { email } });
      if (user) {
        const post = await prisma.post.create({
          data: {
            content: data.post,
            author: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        return NextResponse.json({});
      } else {
        return NextResponse.json({ error: "error" });
      }
    } else {
      return NextResponse.json({ error: "error" });
    }
  }
}
