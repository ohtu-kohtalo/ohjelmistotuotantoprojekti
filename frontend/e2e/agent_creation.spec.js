import { test, expect } from "@playwright/test";

test.describe("Agent Creation on Form Submission", () => {
  test("should create 10 agents when 10 is submitted", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await page.fill('input[placeholder="Enter a number (1–100)"]', "10");

    await page.click('button:has-text("Submit")');

    await expect(
      page.locator("text=10 agents created successfully! ✅"),
    ).toBeVisible({ timeout: 10000 });
  });
});
