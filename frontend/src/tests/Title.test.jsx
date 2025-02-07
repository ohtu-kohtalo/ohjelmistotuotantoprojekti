import { expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Title from "../components/Title";

test("title gets rendered", () => {
  const title = "This is indeed a title";
  render(<Title text={title} />);

  expect(screen.getByText("This is indeed a title")).toBeInTheDocument();
});
