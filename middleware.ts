import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OPTIONS } from "./app/api/auth/[...nextauth]/route";

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/bookmarks",
    "/directs",
    "/notifications",
    "/settings",
  ],
};
