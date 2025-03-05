import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CsvUpload from "../components/CsvUpload";

function createFile(content, fileName = "test.csv") {
  return new File([content], fileName, { type: "text/csv" });
}

describe("CsvUpload Component", () => {
  let onCsvError;
  let onCsvSuccess;
  let uploadButton;
  let hiddenInput;

  beforeEach(() => {
    onCsvError = vi.fn();
    onCsvSuccess = vi.fn();

    render(<CsvUpload onCsvError={onCsvError} onCsvSuccess={onCsvSuccess} />);

    uploadButton = screen.getByRole("button", { name: /upload csv file/i });

    hiddenInput = uploadButton.nextSibling;
  });

  it("calls onCsvSuccess for a valid CSV", async () => {
    const validCsv = createFile("Question1\nQuestion2", "valid.csv");

    fireEvent.change(hiddenInput, { target: { files: [validCsv] } });

    await waitFor(() => {
      expect(onCsvError).not.toHaveBeenCalled();
      expect(onCsvSuccess).toHaveBeenCalledWith('Successfully uploaded "valid.csv".');
    });
  });

  it("shows an error if the CSV file is empty", async () => {
    const emptyCsv = createFile("", "empty.csv");

    fireEvent.change(hiddenInput, { target: { files: [emptyCsv] } });

    await waitFor(() => {
      expect(onCsvError).toHaveBeenCalledWith("CSV is empty");
      expect(onCsvSuccess).not.toHaveBeenCalled();
    });
  });

  it("shows an error if a row has multiple columns", async () => {
    const invalidCsv = createFile("Col1,Col2", "invalid.csv");

    fireEvent.change(hiddenInput, { target: { files: [invalidCsv] } });

    await waitFor(() => {
      expect(onCsvError).toHaveBeenCalledWith(
        "Row 1 can only contain one column. Found 2."
      );
      expect(onCsvSuccess).not.toHaveBeenCalled();
    });
  });

  it("shows an error if a row has only spaces", async () => {
    const spacesCsv = createFile("Question1\n     \nQuestion3", "spaces.csv");

    fireEvent.change(hiddenInput, { target: { files: [spacesCsv] } });

    await waitFor(() => {
      expect(onCsvError).toHaveBeenCalledWith("Row 2 contains only spaces");
      expect(onCsvSuccess).not.toHaveBeenCalled();
    });
  });
});
