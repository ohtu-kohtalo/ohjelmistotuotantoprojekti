import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

const ChatMessage = ({ message }) => (
  <div className={`chat-message ${message.type}`}>
    <strong>{message.type === "query" && "Company:"}</strong>
    <MarkdownRenderer markdownText={message.text} />
  </div>
);

export default ChatMessage;
