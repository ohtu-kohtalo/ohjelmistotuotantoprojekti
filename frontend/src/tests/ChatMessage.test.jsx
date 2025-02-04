import { expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatMessage from "../components/ChatMessage";

vi.mock("./MarkdownRenderer", () => ({
  default: ({ markdownText }) => <span>{markdownText}</span>,
}));

test("ChatMessage component renders queries", () => {
  const message = { type: "query", text: "Mock Company ltd" };

  render(<ChatMessage message={message} />);

  expect(screen.getByText("Company:")).toBeInTheDocument();
  expect(screen.getByText("Mock Company ltd")).toBeInTheDocument();
});

test("ChatMessage component renders responses"),
  () => {
    const message = { type: "response", text: "Here is a bunch of agents" };

    expect(screen.queryByText("Company:")).not.toBeInTheDocument();
    expect(screen.getByText("Here is a bunch of agents")).toBeInTheDocument();
  };
