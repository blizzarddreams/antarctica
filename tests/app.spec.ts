import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:7040");

  await expect(page).toHaveTitle(/antarctica/);
});

test("has explore link", async ({ page }) => {
  await page.goto("http://localhost:7040");

  await expect(page.getByRole("button", { name: /Explore/i })).toHaveText(
    "Explore",
  );
});

test("has explore header", async ({ page }) => {
  await page.goto("http://localhost:7040");
  await page.getByRole("button", { name: /Explore/i }).click();
  await page.waitForURL("**/explore");
  await expect(page.getByText("Explore")).toBeVisible();
});

test("shows post", async ({ page }) => {
  await page.route("*/**/api/explore?skip=0", async (route) => {
    const json = {
      noMore: true,
      posts: [
        {
          id: 1,
          content: "Hello world",
          authorId: 1,
          createdAt: "2023-09-03T21:26:26.726Z",
          image: null,
          replyId: null,
          author: {
            id: 1,
            email: "test@example.com",
            username: "example",

            description: "hello",
            followers: [],
            following: [],
          },
          likes: [],
          reposts: [],
          reply: null,
          replies: [],
        },
      ],
    };

    route.fulfill({ json });
  });

  await page.goto("http://localhost:7040/explore");
  await expect(page.getByText("Hello world")).toBeVisible();
});
