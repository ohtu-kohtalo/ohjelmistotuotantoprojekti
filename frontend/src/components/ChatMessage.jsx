import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
// TODO: Show users query parameters in the chat for user after submitting the form!
const ChatMessage = ({ message }) => (
  <div className={`chat-message ${message.type}`}>
    <strong>{message.type === "query" ? "Company:" : "Response:"}</strong>
    <MarkdownRenderer markdownText={message.text} />
  </div>
);

export default ChatMessage;
