import React, { useState } from "react";
import "./index.css";
import Title from "./components/Title"
import QueryForm from "./components/QueryForm";
import ChatContainer from "./components/ChatContainer";
import ErrorMessage from "./components/ErrorMessage";

const App = () => {
  // Initial states
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState([]);
  const [error, setError] = useState("")

  /**
   * Handles the form submission event.
   * Prevents the default form submission behavior, checks if the query is not empty,
   * and sets the messages state with the user's query and a mock bot response.
   * If an error occurs, sets the messages state with an error message.
   *
   * @param {Event} event - The form submission event.
   * @returns {void}
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!query.trim()) {
      setError("Please enter a valid query.");

      setTimeout(() => {
      setError("");
    }, 5000);
      return;
    }

    setError("");

    try {
      const data = { reply: `\"${query}\"` }; // Mock response
      setResponse([
        { type: "query", text: query },
        { type: "bot", text: data.reply },
      ]);
    } catch (exception) {
      setResponse([
        { type: "query", text: query },
        { type: "bot", text: "Cannot retrieve company data. Please try again." },
      ]);
    }

    setQuery(""); // Clear the input field
  };

  // Separate into own components
  return (
    <div className="app-container">
      <Title text="AI Query Form" />
      {error && <ErrorMessage message={error} />}
      <QueryForm
        query={query}
        setQuery={setQuery}
        handleSubmit={handleSubmit}
      />
      <ChatContainer response={response} />
    </div>
  );
};

export default App;
