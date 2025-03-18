import React, { useRef, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import "./index.css";
import ErrorMessage from "./components/ErrorMessage";
import SuccessMessage from "./components/SuccessMessage";
import HelpPage from "./pages/HelpPage";
import InitialDistribution from "./pages/InitialDistribution";
import AddQuery from "./pages/AddQuery";
import FutureDistribution from "./pages/FutureDistribution";

// const defaultDistribution = [
//   {
//     question: "Question for the agents",
//     data: [
//       { label: "Strongly Disagree", value: 0 },
//       { label: "Disagree", value: 0 },
//       { label: "Neutral", value: 0 },
//       { label: "Agree", value: 0 },
//       { label: "Strongly Agree", value: 0 },
//     ],
//     statistics: { median: 0, mode: 0, "variation ratio": 0 },
//   },
// ];

const defaultDistribution = [];

const App = () => {
  // Initial states for response and error handling
  const [distribution, setDistribution] = useState(defaultDistribution);
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
     * Upon successful fetch, it logs the status message and displays success message to user.
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
        console.log("Agents created!", responseMessage);
        showMessage("Agents succesfully created from initial CSV-file!");
        // setAgentCreation(); Possible endpoint to display created agents initial information and tendency for answers!
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

  /**
   * Handles the submission of a CSV file containing questions to the backend.
   *
   * This function sends the provided questions to the backend as a JSON payload,
   * waits for the response, and updates the state accordingly.
   *
   * @param {Array} csvQuestions - An array of questions extracted from the CSV file.
   * @returns {Promise<void>} - A promise that resolves once the submission is processed.
   */
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
      setDistribution(data.data.distributions);
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
              // Currently bugged! Distributed data cannot be displayed properly in the graphs!
              // element={<InitialDistribution data={agents} />}
              // Forcing sample agent data here (Defined in PlotContainer.jsx-component):
              element={<InitialDistribution />}
            />
            <Route
              path="/addQuery"
              element={
                <AddQuery
                  handleCsvSubmit={handleCsvSubmit}
                  isLoading={isLoading}
                  response={distribution}
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
