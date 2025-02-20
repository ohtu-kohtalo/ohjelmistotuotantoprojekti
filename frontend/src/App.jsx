import React, { useRef, useState, useEffect } from "react";
import "./index.css";
import Title from "./components/Title";
import QueryForm from "./components/QueryForm";
import ChatContainer from "./components/ChatContainer";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import PlotContainer from "./components/PlotContainer";

const App = () => {
  // Initial states
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState([]);
  const [error, setError] = useState("");
  const errorTimeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [website, setWebsite] = useState("");
  const [agentCount, setAgentCount] = useState("");

  const [distributions, setDistributions] = useState(null); // Distributions of agents

  useEffect(() => {
    /**
     * Fetches distributions data from the backend.
     *
     * This function makes an asynchronous request to the backend URL specified in the environment
     * variables or defaults to "http://127.0.0.1:5500" if not specified. It handles the response
     * by checking if the request was successful, parsing the JSON data, and updating the state
     * with the received data. If an error occurs during the fetch operation, it logs the error
     * and displays an error message to the user.
     *
     * @async
     * @function fetchDistributions
     * @throws Will throw an error if the response is not ok.
     * @returns {Dictionary} The distributions data received from the backend:
     * QUESTION: ({ANSWER: COUNT})?
     * ----------------------------
     * Q17B: {null: 4},
     * Q17C: {null: 4},
     * T2 : {1: 1, 3: 1, 5: 1, 6: 1},
     * ...
     * bv1: {2: 2, 8: 1, 10: 1}
     * ----------------------------
     */
    const fetchDistributions = async () => {
      try {
        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
        const response = await fetch(`${BACKEND_URL}/`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        console.log("Distributions received!", data);
        setDistributions(data);
      } catch (error) {
        console.error("Error fetching distributions:", error);
        showError("⚠️ Could not retrieve data from backend");
      }
    };

    fetchDistributions();
  }, []);

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
      showError("⚠️ Cannot submit an empty company name");
      return;
    }

    /* const industry =
      selectedOption === "other" ? customInput.trim() : selectedOption.trim(); */
    const industry = customInput.trim();

    if (!industry) {
      showError("⚠️ Industry field cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
      const response = await fetch(`${BACKEND_URL}/create_agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, industry, website, agentCount }),
      });

      if (!response.ok) {
        const errorMessage = `⚠️ Error: ${response.status} - ${response.statusText}`;
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResponse([
        {
          type: "query",
          text: query,
          industry: industry,
          website: website,
          agentCount: agentCount,
        },
        { type: "bot", text: data.message || "No response message received." },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
      showError("⚠️ Could not retrieve data from backend");
      setResponse([
        {
          type: "query",
          text: query,
          industry: industry,
          website: website,
          agentCount: agentCount,
        },
        {
          type: "bot",
          text: "An error occurred while fetching the response:",
          error_status: "Error code: " + error.message,
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

    // Clear any existing timeout before setting a new one
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    errorTimeoutRef.current = setTimeout(() => {
      setError("");
      errorTimeoutRef.current = null; // Reset ref after clearing error
    }, 5000);
  };

  // Helper function to reset form fields
  const resetForm = () => {
    setQuery("");
    setCustomInput("");
    setSelectedOption("");
    setWebsite("");
    setAgentCount("");
  };

  // Title = title, error for error message,
  // isLoading for showing a loading state,
  // QueryForm for handling query submits,
  // ChatContainer for showing responses of queries
  return (
    <div className="app-container">
      <Title text="Future Customer: A Simulator and Prediction Tool" />
      {error && <ErrorMessage message={error} />}
      <PlotContainer agentData={distributions} />
      <QueryForm
        query={query}
        setQuery={setQuery}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        customInput={customInput}
        website={website}
        setWebsite={setWebsite}
        agentCount={agentCount}
        setAgentCount={setAgentCount}
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
