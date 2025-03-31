import React, { useRef, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import "./index.css";
import ErrorMessage from "./components/ErrorMessage";
import SuccessMessage from "./components/SuccessMessage";
import HelpPage from "./pages/HelpPage";
import InitialDistribution from "./pages/InitialDistribution";
import AddQuery from "./pages/AddQuery";
import CsvDownload from "./components/CsvDownload";

const App = () => {
  // Initial state for distributions
  const [distribution, setDistribution] = useState([]);
  const [futureDistribution, setFutureDistribution] = useState([]);

  // Initial states for response and error handling
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const messageTimeoutRef = useRef(null);

  // Initial state for agents
  const [agents, setAgentCreation] = useState([]);

  // State for checking whether csv has been uploaded
  const [csvUploaded, setCsvUploaded] = useState(false);

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

        const agentsData = await response.json(); // ✅ Expect actual agent data now
        console.log("Agents created!", agentsData);

        setAgentCreation(agentsData); // ✅ Set agent data into state
        showMessage(
          "success",
          "Agents successfully created from backend CSV! ✅"
        );
      } catch (error) {
        console.error("Error creating agents:", error);
        showMessage(
          "error",
          "⚠️ Could not create agents from initial backend CSV-file"
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

      showMessage("success", "CSV submitted successfully! 📂👍");
      const data = await response.json();

      console.log("[DEBUG] Reached here #1");

      setDistribution(data.distributions);
      setFutureDistribution(data.future_distributions);

      if (data.future_distributions.length > 0) {
        console.log("[DEBUG] Reached here #2, with futureDistribution!");
      }

      setCsvUploaded(true);
    } catch (error) {
      console.error("CSV submission error:", error);
      showMessage("error", "⚠️ Could not submit CSV data");
      setCsvUploaded(false);
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
      {/* Render messages above the app-container so they aren’t affected by its hover effect */}
      {message && (
        <>
          {message.type === "error" && <ErrorMessage message={message.text} />}
          {message.type === "success" && (
            <SuccessMessage message={message.text} />
          )}
        </>
      )}
      <div className="app-container">
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
          <div className="sidebar-csv-download">
            <CsvDownload fileName="agent_answers.csv" disabled={!csvUploaded} />
          </div>
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<HelpPage />} />
            <Route
              path="/initialDistribution"
              element={<InitialDistribution data={agents} />}
            />
            <Route
              path="/addQuery"
              element={
                <AddQuery
                  handleCsvSubmit={handleCsvSubmit}
                  isLoading={isLoading}
                  response={distribution}
                  futureResponse={futureDistribution}
                  showMessage={showMessage}
                  resetResponse={() => {
                    setDistribution([]);
                    setFutureDistribution([]);
                  }}
                  setCsvUploaded={setCsvUploaded}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
