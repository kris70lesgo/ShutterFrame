import { expect, test } from "@playwright/test";

test("shows the ShutterFrame foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /migrations should prove/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "System readiness" })).toBeVisible();
});
