import { test, expect } from "@playwright/test";
import user from "./user";

test("show posts on explore", async ({ page }) => {
  await page.route("*/**/api/explore?skip=0", async (route) => {
    const json = {
      noMore: true,
      posts: user.posts,
    };

    route.fulfill({ json });
  });

  await page.goto("http://localhost:7040/explore");
  await expect(page.getByText("nextjs hello world")).toBeVisible();
});
