import { test, expect } from "@playwright/test";
import AdmZip from "adm-zip";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Confirm that user can upload and download a csv file", async ({
  page,
}) => {
  await page.goto("http://localhost:5173");

  // Navigate to the "Add Query" page
  await page.click("text=Add Query");

  // Emulate file upload
  const fileInput = page.locator('input[type="file"]');
  const filePath = path.resolve(__dirname, "fixtures", "questions.csv");
  await fileInput.setInputFiles(filePath);

  // Confirm that CSV has been uploaded
  await expect(page.locator(".likert-chart-container-plot-area")).toBeVisible({
    timeout: 10000,
  });

  // Confirm that the download button is enabled
  const downloadButton = page.locator("button.csv-download-button");
  await expect(downloadButton).toBeEnabled({ timeout: 10000 });

  // Click the download button
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    downloadButton.click(),
  ]);

  // Validate name of downloaded CSV
  await expect(download.suggestedFilename()).toBe("agent_responses.zip");

  // Read the content of the CSV
  const downloadedPath = await download.path();
  const zipBuffer = fs.readFileSync(downloadedPath);
  const zip = new AdmZip(zipBuffer);
  const csv = zip.getEntry("agent_responses.csv");
  const downloadedContent = csv.getData().toString("utf8");

  // Validate CSV headers
  expect(downloadedContent).toContain("Agent,Age,Gender,q1,q2,q3");

  // Check that CSV has more than one line
  const csvLines = downloadedContent.split(/\r?\n/);
  expect(csvLines.length).toBeGreaterThan(1);

  // Check that first non-header line starts with "Agent 1"
  expect(csvLines[1]).toMatch(/Agent\s*1/);
});
