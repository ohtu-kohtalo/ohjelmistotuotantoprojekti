import React, { useState } from "react";
import "./index.css";
import Title from "./components/Title"
import QueryForm from "./components/QueryForm";
import ChatContainer from "./components/ChatContainer";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";

const App = () => {
  // Initial states
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState([]);
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    }, 5000); //sets an error message of 5 seconds if an empty query is submitted
      return;
    }

    setIsLoading(true); //sets a loading state while waiting for a response
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
    } finally {
      setIsLoading(false); //Disables the loading state
      setQuery("") //Clear input field
    }
  };

  // Title = title, error for error message, isLoading for showing a loading state,QueryForm for handling query submits
  // ChatContainer for showing responses of queries
  return (
    <div className="app-container">
      <Title text="AI Query Form" />
      {error && <ErrorMessage message={error} />}
      {isLoading && <LoadingIndicator />}
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
