import { expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingIndicator from "../components/LoadingIndicator";

test("Loading indicator is present", () => {
  render(<LoadingIndicator />);

  expect(screen.getByText("Loading... 🤖"));
});
