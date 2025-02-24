import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

const ChatMessage = ({ message }) => {
  return (
    <div className="chat-message">
      {message.type === "query" ? (
        <div className="query-parameters">
          <h2>Query Parameters</h2>
          <ul>
            {message.text && (
              <li>
                <strong>Company:</strong> {message.text}
              </li>
            )}
            {message.agentCount && (
              <li>
                <strong>Agent Count:</strong> {message.agentCount}
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="agent-responses">
          <div className="agent-answer-container">
            <MarkdownRenderer markdownText={message.text} />
          </div>
          {message.error_status && (
            <p className="error-message">{message.error_status}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
