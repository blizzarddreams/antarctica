import { test, expect } from "@playwright/test";
import user from "./user";

test("show profile", async ({ page }) => {
  await page.route(
    "*/**/api/profile?username=example&skip=0",
    async (route) => {
      const json = {
        user: user,
      };

      route.fulfill({ json });
    },
  );

  await page.goto("http://localhost:3000/@example");
  await expect(page.getByText("nextjs description")).toBeVisible();
});
