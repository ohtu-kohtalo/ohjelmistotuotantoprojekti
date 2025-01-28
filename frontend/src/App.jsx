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
      setError("Please enter a valid query.");

      setTimeout(() => {
        setError("");
      }, 5000); //sets an error message of 5 seconds if an empty query is submitted
      return;
    }

    const industry = selectedOption === "other" ? customInput : selectedOption; // checks whether a custom input has been given to industry

    if (!industry.trim()) {
      setError("Please enter a valid industry."); //checks that industry input is not empty

      setTimeout(() => {
        setError("");
      }, 5000); // sets an error message of 5 seconds
      return;
    }

    setIsLoading(true); // sets a loading state while waiting for a response
    try {
      const response = await fetch("http://127.0.0.1:5000/create_agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          industry: industry,
          website: website,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from the backend.");
      }

      const data = await response.json();

      setResponse([
        { type: "query", text: query },
        // Backend sends a JSON object with a 'message' key
        { type: "bot", text: data.message }, 
      ]);
    } catch (exception) {
      setResponse([
        { type: "query", text: query },
        {
          type: "bot",
          text: "An error occurred while fetching the response. Please try again later.",
        },
      ]);
      console.error(exception); // Log the error for debugging
    } finally {
      setIsLoading(false); // Disables the loading state
      setQuery(""); // Clear input field
      setCustomInput("");
      setSelectedOption("");
      setWebsite("");
    }
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
