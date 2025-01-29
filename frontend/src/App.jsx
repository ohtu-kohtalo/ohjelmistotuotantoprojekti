import React, { useState } from "react";
import "./index.css";
import Title from "./components/Title";
import QueryForm from "./components/QueryForm";
import ChatContainer from "./components/ChatContainer";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";

const App = () => {
  // Initial states
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [website, setWebsite] = useState("");

  /**
   * Handles the form submission event.
   * Prevents the default form submission behavior, checks if the query is not empty,
   * and sets the messages state with the user's query and a mock bot response.
   * If an error occurs, sets the messages state with an error message.
   *
   * @param {Event} event - The form submission event.
   * @returns {void}
   */
  const handleChange = async (event) => {
    const value = event.target.value;
    setSelectedOption(value);

    if (value !== "other") {
      setCustomInput("");
    }
  };

  const handleCustomInputChange = async (event) => {
    setCustomInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!query.trim()) {
      showError("⚠️ Please enter a valid query");
      return;
    }

    const industry =
      selectedOption === "other" ? customInput.trim() : selectedOption.trim();

    if (!industry) {
      showError("⚠️ Please enter a valid industry");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/create_agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, industry, website }),
      });

      if (!response.ok) {
        const errorMessage = `⚠️ Error: ${response.status} - ${response.statusText}`;
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResponse([
        { type: "query", text: query },
        { type: "bot", text: data.message || "No response message received." },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
      showError("⚠️ Could not retrieve data from backend");
      setResponse([
        { type: "query", text: query },
        {
          type: "bot",
          text:
            "An error occurred while fetching the response. \n Error code: " +
            error.message,
        },
      ]);
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  // Helper function to display error messages
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  // Helper function to reset form fields
  const resetForm = () => {
    setQuery("");
    setCustomInput("");
    setSelectedOption("");
    setWebsite("");
  };

  // Title = title, error for error message,
  // isLoading for showing a loading state,
  // QueryForm for handling query submits,
  // ChatContainer for showing responses of queries
  return (
    <div className="app-container">
      <Title text="AI Query Form" />
      {error && <ErrorMessage message={error} />}
      <QueryForm
        query={query}
        setQuery={setQuery}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        customInput={customInput}
        website={website}
        setWebsite={setWebsite}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleCustomInputChange={handleCustomInputChange}
      />
      {isLoading && <LoadingIndicator />}
      <ChatContainer response={response} />
    </div>
  );
};

export default App;
