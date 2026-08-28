import { expect, test } from "@playwright/test";

test("shows the operations dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /add user_preferences table and backfill/i })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Rehearsal progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent runs" })).toBeVisible();
});

test("navigates to workspace pages", async ({ page }) => {
  for (const [path, heading] of [["/runs", "Runs"], ["/integrations", "Integrations"]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
});
