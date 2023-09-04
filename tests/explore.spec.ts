import { server } from "../mocks/server.js";
import { test, expect } from "@playwright/test";
import user from "./user";

test.beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,

// so they don't affect other tests.

test.afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.

test.afterAll(() => server.close());

test("show posts on explore", async ({ page }) => {
  await page.route("*/**/api/explore?skip=0", async (route) => {
    const json = {
      noMore: true,
      posts: user.posts,
    };

    route.fulfill({ json });
  });

  await page.goto("http://localhost:7040/explore");
  await expect(page.getByText("hello world")).toBeVisible();
});
