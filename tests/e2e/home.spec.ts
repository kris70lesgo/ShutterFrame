import { expect, test } from "@playwright/test";

test("shows the operations dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByText("Migration control room")).toBeVisible();
});

test("navigates to workspace pages", async ({ page }) => {
  for (const [path, heading] of [["/rehearsals", "Rehearsals"], ["/integrations", "Integrations"]] as const) {
    await page.goto(path);
    await expect(page.getByRole("banner").getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
});
