import React from "react";
import ReactMarkdown from "react-markdown";

const MarkdownRenderer = ({ markdownText }) => {
  return (
    <div>
      <ReactMarkdown>{markdownText}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
