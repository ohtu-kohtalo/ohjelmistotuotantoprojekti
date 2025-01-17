import React, { useState } from "react";

const App = () => {
  // Default states in the beginning
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!query.trim()) {
      setResponse("Please enter a valid query.");
      return;
    }

    try {
      const data = { reply: `You asked: "${query}"` }; // Mock response
      setResponse(data.reply);
    } catch (exception) {
      setResponse("Something went wrong. Please try again.");
    }

    setQuery(""); // Clear the input field
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>AI Query Form</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label htmlFor="query" style={{ display: "block", marginBottom: "10px" }}>
          Enter your query:
        </label>
        <input
          type="text"
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your question here..."
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            marginBottom: "10px",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007BFF",
            color: "#FFF",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
      {response && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#F8F9FA",
            border: "1px solid #DDD",
            borderRadius: "5px",
            maxWidth: "400px",
          }}
        >
          <strong>AI Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default App;
