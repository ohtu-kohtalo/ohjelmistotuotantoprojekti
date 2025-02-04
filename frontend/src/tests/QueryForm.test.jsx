import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, rerender } from "@testing-library/react";
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
    expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Company Website (Optional)"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    expect(screen.getByLabelText("Number of Agents")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeDisabled(); // checking that the submit button is not active yet
  });

  test("updates the query input field correctly", async () => {
    const input = screen.getByPlaceholderText(
      "Enter company for data retrieval...",
    );
    await userEvent.type(input, "Test Company");

    expect(props.setQuery).toHaveBeenCalledTimes(12);
    expect(props.setQuery).toHaveBeenCalledWith("T");
    expect(props.setQuery).toHaveBeenLastCalledWith("y"); // checks that the input field has been called 12 times, length of test company
    // and that it's been called with 'T' and lastly called with 'y'
  });

  test("validates the website input correctly", async () => {
    const websiteInput = screen.getByPlaceholderText("Enter website URL");

    await userEvent.type(websiteInput, "https://www.valid.com");

    expect(props.setWebsite).toHaveBeenCalledTimes(21);
    expect(props.setWebsite).toHaveBeenCalledWith("h");
    expect(props.setWebsite).toHaveBeenLastCalledWith("m"); // checks that the input field changer has been called 21 times
    // 21 is the length of the string, and that h is in there and m is the last character it's been called with
  });

  test("updates agent count correctly", async () => {
    const dropdown = screen.getByLabelText("Number of Agents");

    await userEvent.selectOptions(dropdown, "2");
    expect(props.setAgentCount).toHaveBeenCalledWith(2);
  });

  test("enables submit button when required fields are filled", async () => {
    props.agentCount = "2";
    props.query = "https://www.valid.com";

    utils.rerender(<QueryForm {...props} />);
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
