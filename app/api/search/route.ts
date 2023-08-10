import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
  const prisma = new PrismaClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("params");

  if (search) {
    const prisma = new PrismaClient();

    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: search!,
        },
      },
      orderBy: { createdAt: "desc" },
      include: { author: true, likes: true, reposts: true },
    });

    return NextResponse.json({ posts });
  }
}
