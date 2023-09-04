import { server } from "../mocks/server.js";
import { test, expect } from "@playwright/test";

test.beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,

// so they don't affect other tests.

test.afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.

test.afterAll(() => server.close());

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
