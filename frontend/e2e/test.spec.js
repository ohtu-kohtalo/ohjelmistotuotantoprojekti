import { test, expect } from "@playwright/test";
import path from "path";
import AdmZip from "adm-zip";
import Papa from "papaparse";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// App and fixtures
const APP_URL = "http://localhost:5173";
const QUESTIONS_FIXTURE = path.resolve(__dirname, "fixtures", "questions.csv");

// Zip validation helper
test.describe.configure({ retries: 0 });
function validateCsv(zip, entryName) {
  const csvText = zip.readAsText(entryName);
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  expect(parsed.data).toHaveLength(3);
  expect(parsed.meta.fields).toEqual([
    "Agent",
    "Age",
    "Gender",
    "q1",
    "q2",
    "q3",
  ]);

  ["q1", "q2", "q3"].forEach((q) => {
    const hasAnswer = parsed.data.some((row) => row[q]?.trim());
    expect(hasAnswer).toBe(true);
  });
}

// Agent creation test
test("Agent Creation: submits 5 and shows success message", async ({ page }) => {
  await page.goto(APP_URL);
  await page.fill(
    "input[placeholder=\"Enter a number (1–100)\"]",
    "5"
  );
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(
    page.getByText("5 agents created successfully! ✅"),
    { timeout: 10000 }
  ).toBeVisible();
});

// Dashboard navigation test
test(
  "Dashboard button takes you to /future",
  async ({ page }) => {
    await page.goto(APP_URL);
    await page.fill(
      "input[placeholder=\"Enter a number (1–100)\"]",
      "5"
    );
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByText("5 agents created successfully! ✅"),
      { timeout: 10000 }
    ).toBeVisible();

    const dashboardBtn = page.getByRole("button", { name: "Dashboard 📈" });
    await expect(dashboardBtn).toBeEnabled();
    await dashboardBtn.click();
    await expect(page).toHaveURL(`${APP_URL}/future`);
  }
);

// CSV upload test
test(
  "CSV Upload Shows CSV-loaded and unlocks Present answers",
  async ({ page }) => {
    await page.goto(APP_URL);
    await page.fill(
      "input[placeholder=\"Enter a number (1–100)\"]",
      "5"
    );
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("button", { name: "Dashboard 📈" }).click();
    await expect(page).toHaveURL(`${APP_URL}/future`);

    const presentBtn = page.getByRole("button", { name: "Present answers" });
    await expect(presentBtn).toBeDisabled();

    await page.setInputFiles("#csvFileInput", QUESTIONS_FIXTURE);
    await page.getByRole("button", { name: "Upload CSV" }).click();

    const csvIndicator = page.locator(
      "span:has-text(\"❓\") + div.bg-green-600.border-green-400.text-white"
    );
    await expect(csvIndicator).toHaveCount(1);
    await expect(csvIndicator).toBeVisible();
    await expect(presentBtn).toBeEnabled();
  }
);

// Future scenario test
// Also confirms that future scenario resets questions
test(
  "Future Scenario upload successful and unlocks Future Scenario answers",
  async ({ page }) => {
    await page.goto(APP_URL);
    await page.fill(
      "input[placeholder=\"Enter a number (1–100)\"]",
      "5"
    );
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("button", { name: "Dashboard 📈" }).click();
    await expect(page).toHaveURL(`${APP_URL}/future`);

    // Initial CSV upload
    await page.setInputFiles("#csvFileInput", QUESTIONS_FIXTURE);
    await page.getByRole("button", { name: "Upload CSV" }).click();
    await expect(
      page.locator("span:has-text(\"❓\") + div.bg-green-600.border-green-400.text-white"),
      { timeout: 10000 }
    ).toBeVisible();

    const futureBtn = page.getByRole("button", { name: "Future Scenario Answers" });
    await expect(futureBtn).toBeDisabled();

    // Submit scenario
    await page.fill(
      "textarea[placeholder=\"Enter future scenario...\"]",
      "global food production has fallen"
    );
    await page.getByRole("button", { name: "Submit 🔓" }).click();

    const overlay = page.locator("div.fixed.inset-0.z-50.bg-black\\/30");
    await overlay.waitFor({ state: "hidden", timeout: 20000 });

    // Re-upload CSV
    await page.setInputFiles("#csvFileInput", QUESTIONS_FIXTURE);
    await page.getByRole("button", { name: "Upload CSV" }).click();
    await expect(
      page.locator("span:has-text(\"❓\") + div.bg-green-600.border-green-400.text-white"),
      { timeout: 10000 }
    ).toBeVisible();

    const scenarioIndicator = page.locator(
      "span:has-text(\"📝\") + div.bg-green-600.border-green-400.text-white"
    );
    await expect(scenarioIndicator).toHaveCount(1);
    await expect(scenarioIndicator).toBeVisible();
    await expect(futureBtn).toBeEnabled();
  }
);

// CSV download test
test(
  "CSV download works and contains correct files with correct data",
  async ({ page }) => {
    await page.goto(APP_URL);
    await page.fill(
      "input[placeholder=\"Enter a number (1–100)\"]",
      "3"
    );
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByText("3 agents created successfully! ✅"),
      { timeout: 10000 }
    ).toBeVisible();
    await page.getByRole("button", { name: "Dashboard 📈" }).click();
    await expect(page).toHaveURL(`${APP_URL}/future`);

    await page.fill(
      "textarea[placeholder=\"Enter future scenario...\"]",
      "global food production has fallen"
    );
    await page.getByRole("button", { name: "Submit 🔓" }).click();
    const overlay2 = page.locator("div.fixed.inset-0.z-50.bg-black\\/30");
    await overlay2.waitFor({ state: "hidden", timeout: 20000 });

    await page.setInputFiles("#csvFileInput", QUESTIONS_FIXTURE);
    await page.getByRole("button", { name: "Upload CSV" }).click();
    await expect(
      page.locator("span:has-text(\"❓\") + div.bg-green-600.border-green-400.text-white"),
      { timeout: 10000 }
    ).toBeVisible();

    // Download
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download CSV" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("agent_responses.zip");

    // Unzip and validate
    const zip = new AdmZip(await download.path());
    const entries = zip.getEntries().map((e) => e.entryName).sort();
    expect(entries).toEqual([
      "agent_future_responses.csv",
      "agent_responses.csv",
    ]);

    validateCsv(zip, "agent_responses.csv");
    validateCsv(zip, "agent_future_responses.csv");
  }
);