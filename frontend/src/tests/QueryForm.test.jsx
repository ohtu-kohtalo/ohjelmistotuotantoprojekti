import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QueryForm from "../components/QueryForm";
import userEvent from "@testing-library/user-event";

describe("QueryForm Component", () => {
  let props;
  let utils;

  beforeEach(() => {
    props = {
      query: "",
      setQuery: vi.fn(),
      selectedOption: "",
      setSelectedOption: vi.fn(),
      customInput: "",
      handleSubmit: vi.fn((e) => e.preventDefault()),
      handleChange: vi.fn(),
      handleCustomInputChange: vi.fn(),
      website: "",
      setWebsite: vi.fn(),
      agentCount: "",
      setAgentCount: vi.fn(),
    };

    utils = render(<QueryForm {...props} />);
  });

  test("renders the form fields correctly", async () => {
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Agents/i)).toBeInTheDocument();

    // Check that the submit button is initially disabled
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  test("updates the query input field correctly", async () => {
    const input = screen.getByPlaceholderText(
      "Enter company for data retrieval...",
    );
    await userEvent.type(input, "Test Company");

    expect(props.setQuery).toHaveBeenCalledTimes(12);
    expect(props.setQuery).toHaveBeenCalledWith("T");
    expect(props.setQuery).toHaveBeenLastCalledWith("y");
  });

  test("validates the website input correctly", async () => {
    const websiteInput = screen.getByPlaceholderText("Enter website URL");

    await userEvent.type(websiteInput, "https://www.valid.com");

    expect(props.setWebsite).toHaveBeenCalledTimes(21);
    expect(props.setWebsite).toHaveBeenCalledWith("h");
    expect(props.setWebsite).toHaveBeenLastCalledWith("m");
  });

  test("updates agent count correctly", async () => {
    const dropdown = screen.getByLabelText(/Number of Agents/i);

    await userEvent.selectOptions(dropdown, "2");
    expect(props.setAgentCount).toHaveBeenCalledWith(2);
  });

  test("enables submit button when required fields are filled", async () => {
    // Fill in required fields using user events
    await userEvent.type(
      screen.getByLabelText(/Company Name/i),
      "Test Company",
    );
    await userEvent.type(screen.getByLabelText(/Industry/i), "Technology");
    await userEvent.selectOptions(
      screen.getByLabelText(/Number of Agents/i),
      "2",
    );

    // Re-render with updated props
    props.query = "Test Company";
    props.customInput = "Technology";
    props.agentCount = "2";

    utils.rerender(<QueryForm {...props} />);

    // Verify submit button is now enabled
    expect(screen.getByTestId("submit-button")).toBeEnabled();
  });

  test("calls handleSubmit when form is submitted", async () => {
    const websiteInput = screen.getByPlaceholderText("Enter website URL");

    await userEvent.type(websiteInput, "https://www.valid.com");
    const form = screen.getByTestId("query-form");

    await fireEvent.submit(form);
    expect(props.handleSubmit).toHaveBeenCalled();
  });
});
