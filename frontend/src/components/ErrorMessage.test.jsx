import { expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorMessage from "./ErrorMessage";

test("Error message gets shown", () => {
  const errorText = "Oops! something went wrong";

  render(<ErrorMessage message={errorText} />);

  expect(screen.getByText("Oops! something went wrong")).toBeInTheDocument();
});
