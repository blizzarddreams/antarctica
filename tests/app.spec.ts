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
