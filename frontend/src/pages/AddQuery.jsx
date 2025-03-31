import React, { useState, useRef } from "react";
import CsvUpload from "../components/CsvUpload";
import LoadingIndicator from "../components/LoadingIndicator";
import LikertChartContainer from "../components/LikertChartContainer";

/**
 * AddQuery Component
 *
 * This component provides functionality for uploading a CSV file containing questions
 * and submitting a potential future scenario for agents. It includes input validation, error handling,
 * and temporary feedback messages for user interactions.
 *
 * @param {Object} props - The page props:
 *
 * @param {Function} props.handleCsvSubmit - Callback function to handle CSV file submission.
 * @param {boolean} props.isLoading - Indicates whether a loading state is active.
 * @param {Function} props.showMessage - Function to display messages (success or error) to the user.
 * @param {Array} props.response - Data used to render Likert charts. *
 * @param {Array} props.futureResponse - Future scenario data from the backend.
 * @param {Function} props.resetResponse - Clears the chart data.
 * @param {Function} props.setCsvUploaded - Notifies App-level state of CSV submission.
 *
 * @returns {JSX.Element} The rendered AddQuery component.
 */
const AddQuery = ({
  handleCsvSubmit,
  isLoading,
  showMessage,
  response,
  futureResponse,
  resetResponse,
  setCsvUploaded,
}) => {
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [futureScenario, setFutureScenario] = useState("");
  const [tempMessage, setTempMessage] = useState("");
  const [futureScenarioLoading, setFutureScenarioLoading] = useState(false);
  const tempMessageTimeout = useRef(null);

  /**
   * Shows a temporary message for a defined duration, and ensures no overlap.
   * @param {string | JSX.Element} message - The message to display.
   * @param {number} duration - Duration in ms.
   */
  const showTempMessage = (message, duration = 3000) => {
    setTempMessage(message);
    if (tempMessageTimeout.current) clearTimeout(tempMessageTimeout.current);
    tempMessageTimeout.current = setTimeout(() => {
      setTempMessage("");
    }, duration);
  };

  /**
   * Handles successful CSV upload.
   * Displays a success message to the user and sets the CSV loaded state to true.
   *
   * @param {string} message - The success message to display.
   */
  const handleCsvSuccess = (message) => {
    showMessage("success", message);
    setCsvLoaded(true);
  };

  /**
   * Handles errors during CSV upload.
   * Displays an error message to the user and sets the CSV loaded state to false.
   *
   * @param {string} errorMessage - The error message to display.
   */
  const handleCsvError = (errorMessage) => {
    showMessage("error", errorMessage);
    setCsvLoaded(false);
  };

  /**
   * Submits the future scenario input to the backend for processing.
   *
   * - Checks if the input scenario is at least 5 characters long.
   * - Shows a temporary message indicating submission has started.
   * - Sends a POST request to the backend endpoint `/receive_future_scenario`.
   * - Logs the submitted scenario and backend response.
   * - Displays a success or error message based on the result.
   * - Always resets loading state after completion.
   */
  const handleFutureSubmit = async () => {
    if (futureScenario.length >= 5) {
      const helperFutureScenario = futureScenario;

      showTempMessage("Scenario submitted 📨");
      setFutureScenarioLoading(true);
      setFutureScenario("");

      try {
        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
        const response = await fetch(`${BACKEND_URL}/receive_future_scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: helperFutureScenario,
          }),
        });

        console.log("Submitted Future Scenario:", helperFutureScenario);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Future scenario return data:", data);

        showTempMessage("Scenario deployed succesfully ✅");
        handleReset();
      } catch (error) {
        console.error("Future scenario submission error:", error);
        showTempMessage(
          <span style={{ color: "red" }}>⚠️ Error deploying scenario!</span>
        );
      } finally {
        setFutureScenarioLoading(false);
      }
    }
  };

  const handleReset = () => {
    setCsvLoaded(false);
    setCsvUploaded(false);
    setFutureScenario("");
    resetResponse();
  };

  return (
    <div className="card active">
      {/* Move LikertChartContainer to the top */}
      <LikertChartContainer
        chartsData={response || []}
        futureData={futureResponse || []}
      />

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

      {/* For future scenario loading */}
      {futureScenarioLoading && (
        <div className="loading-overlay">
          <LoadingIndicator />
        </div>
      )}

      {/* Loading Indicator (Appears on Top) (For CSV-uploading)*/}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default AddQuery;
