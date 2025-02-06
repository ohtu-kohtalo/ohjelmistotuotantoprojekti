import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

const ChatMessage = ({ message }) => {
  return (
    <div className={`chat-message ${message.type}`}>
      <strong>{message.type === "query" ? "Query Parameters:" : ""}</strong>
      {<hr />}
      {/* Render Query Parameters as Bullet Points */}
      {message.type === "query" ? (
        <ul>
          {message.text && (
            <li>
              <strong>Company:</strong> {message.text}
            </li>
          )}
          {message.industry && (
            <li>
              <strong>Industry:</strong> {message.industry}
            </li>
          )}
          {message.website && (
            <li>
              <strong>Website:</strong> {message.website}
            </li>
          )}
          {message.agentCount && (
            <li>
              <strong>Agent Count:</strong> {message.agentCount}
            </li>
          )}
        </ul>
      ) : (
        <div>
          <MarkdownRenderer markdownText={message.text} />
          {message.error_status && (
            <p style={{ color: "red", fontWeight: "bold", marginTop: "-10px" }}>
              {message.error_status}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
