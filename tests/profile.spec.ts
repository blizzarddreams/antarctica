import { server } from "../mocks/server";
import { test, expect } from "@playwright/test";
import user from "./user";
test.beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,

// so they don't affect other tests.

test.afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.

test.afterAll(() => server.close());

test("show post", async ({ page }) => {
  await page.route("*/**/api/post?id=1", async (route) => {
    const json = {
      post: user.posts[0],
    };

    route.fulfill({ json });
  });

  await page.goto(`http://localhost:7040/@example/1`);
  await expect(page.getByText("hello world")).toBeVisible();
});

test("show profile", async ({ page }) => {
  await page.route("*/**/api/profile?username=example", async (route) => {
    const json = {
      user: user,
    };
    route.fulfill({ json });
  });
  await page.goto(`http://localhost:7040/@example`);
  await expect(page.getByText("hello world")).toBeVisible();
});
