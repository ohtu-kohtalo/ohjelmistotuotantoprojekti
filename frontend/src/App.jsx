import React, { useRef, useState, useEffect } from "react";
import "./index.css";
import Title from "./components/Title";
import QueryForm from "./components/QueryForm";
import ChatContainer from "./components/ChatContainer";
import ErrorMessage from "./components/ErrorMessage";
import SuccessMessage from "./components/SuccessMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import PlotContainer from "./components/PlotContainer";
import CsvUpload from "./components/CsvUpload";

const App = () => {
  // Initial states for user input
  const [question, setQuestion] = useState("");
  const [agentCount, setAgentCount] = useState("");

  // Initial states for response and error handling
  const [response, setResponse] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const messageTimeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initial state for aquired distributions data
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
     * QUESTION: {ANSWER: COUNT}
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
        showMessage("error", "⚠️ Could not retrieve data from backend");
      }
    };

    fetchDistributions();
  }, []);

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

    if (!question.trim()) {
      showMessage("error", "⚠️ Cannot submit an empty question");
      return;
    }

    setIsLoading(true);

    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
      const response = await fetch(`${BACKEND_URL}/create_agent_response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question,
          agent_count: agentCount,
        }),
      });

      if (!response.ok) {
        const errorMessage = `⚠️ Error: ${response.status} - ${response.statusText}`;
        showMessage("error", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResponse([
        {
          type: "query",
          text: question,
          agentCount: agentCount,
        },
        { type: "bot", text: data.message || "No response message received." },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
      showMessage("error", "⚠️ Could not retrieve data from backend");
      setResponse([
        {
          type: "query",
          text: question,
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
  const showMessage = (type, text) => {
    setMessage({ type, text });

    // Clear any existing timeout before setting a new one
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ type: "", text: "" });
      messageTimeoutRef.current = null; // Reset ref after clearing error
    }, 5000);
  };

  // Helper function to reset form fields
  const resetForm = () => {
    setQuestion("");
    setAgentCount("");
  };

  // Title = title, error for error message,
  // isLoading for showing a loading state,
  // QueryForm for handling query submits,
  // ChatContainer for showing responses of queries
  return (
    <div className="app-container">
      <Title text="Future Customer: A Simulator and Prediction Tool" />
      {message &&
        (message.type === "error" ? (
          <ErrorMessage message={message.text} />
        ) : (
          <SuccessMessage message={message.text} />
        ))}
      <CsvUpload
        onCsvError={(errorMessage) => showMessage("error", errorMessage)}
        onCsvSuccess={(successMessage) =>
          showMessage("success", successMessage)
        }
      />
      <PlotContainer agentData={distributions} />
      <QueryForm
        question={question}
        setQuestion={setQuestion}
        agentCount={agentCount}
        setAgentCount={setAgentCount}
        handleSubmit={handleSubmit}
      />
      {isLoading && <LoadingIndicator />}
      <ChatContainer response={response} />
    </div>
  );
};

export default App;
