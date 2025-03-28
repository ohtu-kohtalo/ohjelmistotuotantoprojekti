import { test, expect } from "@playwright/test";

test.describe("Agent Creation on Page Load", () => {
  test("Confirm that agents are created when page loads", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await expect(
      page.locator("text=Agents successfully created from backend CSV! ✅"),
    ).toBeVisible({ timeout: 10000 });
  });
});
