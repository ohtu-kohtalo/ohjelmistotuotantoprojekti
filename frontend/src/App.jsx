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

  const handleCsvSubmit = async (csvQuestions) => {
    setIsLoading(true);
    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
      const response = await fetch(
        `${BACKEND_URL}/download_agent_response_csv`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: csvQuestions,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      showMessage("success", "CSV submitted successfully");
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
    // <div className="app-container">
    //   <Title text="Future Customer: A Simulator and Prediction Tool" />
    //   {message &&
    //     (message.type === "error" ? (
    //       <ErrorMessage message={message.text} />
    //     ) : (
    //       <SuccessMessage message={message.text} />
    //     ))}
    //   <CsvUpload
    //     onCsvError={(errorMessage) => showMessage("error", errorMessage)}
    //     onCsvSuccess={(successMessage) =>
    //       showMessage("success", successMessage)
    //     }
    //     handleCsvSubmit={handleCsvSubmit}
    //   />
    //   <PlotContainer agentData={distributions} />
    //   {/* <QueryForm
    //     question={question}
    //     setQuestion={setQuestion}
    //     agentCount={agentCount}
    //     setAgentCount={setAgentCount}
    //     handleSubmit={handleSubmit}
    //   /> */}
    //   {isLoading && <LoadingIndicator />}
    //   <ChatContainer response={response} />
    // </div>

    // NEW PAGE LAYOUT (in progress)

    // <div>
    //   {message &&
    //       (message.type === "error" ? (
    //         <ErrorMessage message={message.text} />
    //       ) : (
    //         <SuccessMessage message={message.text} />
    //   ))}
    //   <HelpPage />
    //   <InitialDistribution distributions={distributions} />
    //   <AddQuery
    //     handleCsvSubmit={handleCsvSubmit}
    //     isLoading={isLoading}
    //     response={response}
    //     showMessage={showMessage}
    //   />
    //   <FutureDistribution />
    // </div>

    <BrowserRouter>
      <div className="app-container">
        <div className="header-container">
          <Title text="Future Customer: A Simulator and Prediction Tool" />
          {message &&
            (message.type === "error" ? (
              <ErrorMessage message={message.text} />
            ) : (
              <SuccessMessage message={message.text} />
            ))}
        </div>
        <div className="main-layout">
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
                element={<InitialDistribution distributions={distributions} />}
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
      </div>
    </BrowserRouter>
  );
};

export default App;
