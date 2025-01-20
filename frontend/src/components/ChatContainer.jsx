import React from "react";
import ChatMessage from "./ChatMessage";

const ChatContainer = ({ response }) => (
    <div className="chat-container">
        {response.map((message, index) => (
            <ChatMessage key={index} message={message} />
        ))}
    </div>
);

export default ChatContainer;