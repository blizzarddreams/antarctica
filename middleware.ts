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
