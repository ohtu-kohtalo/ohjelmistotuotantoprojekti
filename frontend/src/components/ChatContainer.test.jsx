import { expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatContainer from "./ChatContainer";

test("renders messages passed as props", () => {
  const messages = [
    { type: "query", text: "Hello" },
    { type: "query", text: "Nice day outside!" },
    { type: "query", text: "This should work." },
  ];

  render(<ChatContainer response={messages} />);

  messages.forEach((msg) => {
    expect(screen.getByText(msg.text)).toBeInTheDocument();
  });
});

test("renders nothing when empty list is given", () => {
  render(<ChatContainer response={[]} />);

  const chatContainer = screen.getByTestId("chat-container");

  expect(chatContainer).toBeInTheDocument();
  expect(chatContainer).toBeEmptyDOMElement();
});
