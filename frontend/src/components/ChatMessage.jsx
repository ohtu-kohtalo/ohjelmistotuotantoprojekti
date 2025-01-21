import React from "react";

const ChatMessage = ({ message }) => (
    <div className={`chat-message ${message.type}`}>
        <strong>{message.type === "query" ? "Query:" : "Response:"}</strong>
        <p>{message.text}</p>
    </div>
);

export default ChatMessage;