import React, { useState, useRef } from "react";
import CsvUpload from "../components/CsvUpload";
import LoadingIndicator from "../components/LoadingIndicator";
import LikertChartContainer from "../components/LikertChartContainer";

/**
 * AddQuery Component
 *
 * This component allows users to:
 * - Upload a CSV file containing questions
 * - Submit a future scenario for agents
 * - View Likert-scale visualizations and basic stats
 *
 * The `submittedScenario` is shared from a higher-level component (e.g., App)
 * to persist across route changes but reset on full page refresh.
 *
 * @param {Object} props
 * @param {Function} props.handleCsvSubmit - Callback for CSV submission.
 * @param {boolean} props.isLoading - Whether loading state is active.
 * @param {Function} props.showMessage - Function to show toast messages.
 * @param {Array} props.response - Current Likert data.
 * @param {Array} props.futureResponse - Future scenario Likert data.
 * @param {Function} props.resetResponse - Clears Likert chart state.
 * @param {Function} props.setCsvUploaded - Notifies that CSV was uploaded.
 * @param {string} props.submittedScenario - The submitted scenario text (shared state).
 * @param {Function} props.setSubmittedScenario - Setter for submittedScenario.
 *
 * @returns {JSX.Element}
 */
const AddQuery = ({
  handleCsvSubmit,
  isLoading,
  showMessage,
  response,
  futureResponse,
  resetResponse,
  setCsvUploaded,
  submittedScenario, // ✅ Passed down to persist across routes
  setSubmittedScenario, // ✅ Setter passed down from parent (App)
}) => {
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [futureScenario, setFutureScenario] = useState(""); // For input field
  const [tempMessage, setTempMessage] = useState("");
  const [futureScenarioLoading, setFutureScenarioLoading] = useState(false);
  const tempMessageTimeout = useRef(null);

  /**
   * Displays a temporary success/error message.
   */
  const showTempMessage = (message, duration = 3000) => {
    setTempMessage(message);
    if (tempMessageTimeout.current) clearTimeout(tempMessageTimeout.current);
    tempMessageTimeout.current = setTimeout(() => {
      setTempMessage("");
    }, duration);
  };

  const handleCsvSuccess = (message) => {
    showMessage("success", message);
    setCsvLoaded(true);
  };

  const handleCsvError = (errorMessage) => {
    showMessage("error", errorMessage);
    setCsvLoaded(false);
  };

  /**
   * Submits the future scenario to the backend and updates shared state.
   */
  const handleFutureSubmit = async () => {
    if (futureScenario.length >= 5) {
      resetResponse(); // Clear existing chart data before new scenario
      const helperFutureScenario = futureScenario;

      showTempMessage("Scenario submitted 📨");
      setFutureScenarioLoading(true);
      setSubmittedScenario(futureScenario); // ✅ Shared state update
      setFutureScenario(""); // Clear input field

      try {
        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
        const response = await fetch(`${BACKEND_URL}/receive_future_scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario: helperFutureScenario }),
        });

        console.log("Submitted Future Scenario:", helperFutureScenario);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Future scenario return data:", data);

        showTempMessage("Scenario deployed successfully ✅");
        handleReset();
      } catch (error) {
        console.error("Future scenario submission error:", error);
        showTempMessage(
          <span style={{ color: "red" }}>⚠️ Error deploying scenario!</span>,
        );
      } finally {
        setFutureScenarioLoading(false);
      }
    }
  };

  /**
   * Resets form-related state and clears uploaded file state.
   */
  const handleReset = () => {
    setCsvLoaded(false);
    setCsvUploaded(false);
    setFutureScenario("");
    resetResponse();
  };

  return (
    <div className="card active">
      {/* Chart section */}
      <LikertChartContainer
        chartsData={response || []}
        futureData={futureResponse || []}
        submittedScenario={submittedScenario || ""}
      />

      {/* CSV & Scenario Input Section */}
      <div className="query-input-container">
        {/* CSV Upload Section */}
        <div className="csv-upload-section">
          <p id="csvUploadDescription">
            Upload a CSV file with questions on it. Correct format for the file
            is one question per row in the first column.
          </p>
          <CsvUpload
            onCsvError={handleCsvError}
            onCsvSuccess={handleCsvSuccess}
            handleCsvSubmit={handleCsvSubmit}
          />
          <button
            onClick={handleReset}
            className="likert-question-submit-button"
            disabled={!csvLoaded}
          >
            Reset
          </button>
        </div>

        {/* Future Scenario Input */}
        <div className="future-scenario-input-container">
          <h1 id="futureScenarioTitle">Future Scenario</h1>
          <input
            type="text"
            id="futureScenarioInputField"
            name="futureScenarioInputField"
            placeholder="Enter future scenario for agents"
            value={futureScenario}
            onChange={(e) => setFutureScenario(e.target.value)}
          />
          <button
            id="futureScenarioSubmitButton"
            onClick={handleFutureSubmit}
            disabled={futureScenario.length < 5 || futureScenarioLoading}
          >
            Submit {futureScenario.length < 5 ? "🔒" : "🔓"}
          </button>

          {/* Temporary Message Display */}
          {tempMessage && (
            <div
              style={{
                position: "absolute",
                marginTop: "70px",
                color: "green",
                fontSize: "12px",
              }}
            >
              {tempMessage}
            </div>
          )}
        </div>
      </div>

      {/* Overlay Loading Indicators */}
      {futureScenarioLoading && (
        <div className="loading-overlay">
          <LoadingIndicator />
        </div>
      )}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default AddQuery;
