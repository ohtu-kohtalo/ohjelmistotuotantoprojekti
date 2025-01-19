import React, { useState } from "react";
import "./index.css";

const App = () => {
  // Initial states
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState([]);

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
      setResponse("Please enter a valid query.");
      return;
    }

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
      <h1 className="title">AI Query Form</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="query" className="label">
          Company name:
        </label>
        <input
          type="text"
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter company for data retrieval..."
          className="input"
        />
        <button type="submit" className="button">
          Submit
        </button>
      </form>
      <div className="chat-container">
        {response.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.type}`}
          >
            <strong>{message.type === "query" ? "Query:" : "Response:"}</strong>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
