import React, { useRef, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import "./index.css";
import Title from "./components/Title"; // To be removed
import QueryForm from "./components/QueryForm"; // To be removed
import ChatContainer from "./components/ChatContainer"; // To be removed
import ErrorMessage from "./components/ErrorMessage";
import SuccessMessage from "./components/SuccessMessage";
import LoadingIndicator from "./components/LoadingIndicator"; // To be removed
import PlotContainer from "./components/PlotContainer"; // To be removed
import CsvUpload from "./components/CsvUpload"; // To be removed
import HelpPage from "./pages/HelpPage";
import InitialDistribution from "./pages/InitialDistribution";
import AddQuery from "./pages/AddQuery";
import FutureDistribution from "./pages/FutureDistribution";

const defaultDistribution = [
  {
    question: "Question for the agents",
    data: [
      { label: "Strongly Disagree", value: 0 },
      { label: "Disagree", value: 0 },
      { label: "Neutral", value: 0 },
      { label: "Agree", value: 0 },
      { label: "Strongly Agree", value: 0 },
    ],
  },
];

const App = () => {
  // Initial states for user input
  const [question, setQuestion] = useState("");
  const [agentCount, setAgentCount] = useState("");

  // Initial states for response and error handling
  const [response, setResponse] = useState(defaultDistribution);
  const [message, setMessage] = useState({ type: "", text: "" });
  const messageTimeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initial state for agents
  const [agents, setAgentCreation] = useState(null); // Agents

  useEffect(() => {
    /**
     * Asynchronously creates agents by fetching data from the backend.
     *
     * This function attempts to initiate a create-agent route on the backend side.
     * Upon successful fetch, it logs the status message.
     *
     * @async
     * @function createAgents
     * @returns {Promise<void>} A promise that resolves when the agents are created.
     * @throws Will throw an error if the fetch request fails.
     */
    const createAgents = async () => {
      try {
        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
        const response = await fetch(`${BACKEND_URL}/`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const responseMessage = await response.json();
        console.log("Distributions received!", responseMessage);
        setAgentCreation(responseMessage);
      } catch (error) {
        console.error("Error creating agents:", error);
        showMessage(
          "error",
          "⚠️ Could not create agents from initial backend CSV-file",
        );
      }
    };

    createAgents();
  }, []);

  const handleCsvSubmit = async (csvQuestions) => {
    setIsLoading(true);
    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
      const response = await fetch(`${BACKEND_URL}/receive_user_csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: csvQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      showMessage("success", "CSV submitted successfully");
      setResponse(data.data.distributions);
    } catch (error) {
      console.error("CSV submission error:", error);
      showMessage("error", "⚠️ Could not submit CSV data");
    } finally {
      setIsLoading(false);
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

  return (
    <BrowserRouter>
      <div className="app-container">
        {message &&
          (message.type === "error" ? (
            <ErrorMessage message={message.text} />
          ) : (
            <SuccessMessage message={message.text} />
          ))}
        <div className="sidebar">
          <Link to="/" className="sidebar-link">
            Help Page
          </Link>
          <Link to="/initialDistribution" className="sidebar-link">
            Initial Distribution
          </Link>
          <Link to="/addQuery" className="sidebar-link">
            Add Query
          </Link>
          <Link to="/futureDistribution" className="sidebar-link">
            Future Distribution
          </Link>
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<HelpPage />} />
            <Route
              path="/initialDistribution"
              element={<InitialDistribution distributions={agents} />}
            />
            <Route
              path="/addQuery"
              element={
                <AddQuery
                  question={question}
                  setQuestion={setQuestion}
                  agentCount={agentCount}
                  setAgentCount={setAgentCount}
                  handleCsvSubmit={handleCsvSubmit}
                  isLoading={isLoading}
                  response={response}
                  showMessage={showMessage}
                />
              }
            />
            <Route
              path="/futureDistribution"
              element={<FutureDistribution />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
