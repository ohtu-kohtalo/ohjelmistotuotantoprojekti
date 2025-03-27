import React, { useState } from "react";
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
 * @param {Object} props - The component props.
 * @param {Function} props.handleCsvSubmit - Callback function to handle CSV file submission.
 * @param {boolean} props.isLoading - Indicates whether a loading state is active.
 * @param {Function} props.showMessage - Function to display messages (success or error) to the user.
 * @param {Array} props.response - Data used to render Likert charts.
 *
 * @returns {JSX.Element} The rendered AddQuery component.
 */
const AddQuery = ({ handleCsvSubmit, isLoading, showMessage, response }) => {
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [futureScenario, setFutureScenario] = useState("");
  const [tempMessage, setTempMessage] = useState("");

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

  const handleFutureSubmit = async () => {
    if (futureScenario.length >= 5) {
      try {
        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
        const response = await fetch(`${BACKEND_URL}/receive_future_scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: futureScenario,
          }),
        });
        console.log("Submitted Future Scenario:", futureScenario);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        // The returned data is a status message {status: "success"}
        // Console.log for debugging purposes
        const data = await response.json();
        console.log("Future scenario return data:", data);

        // Set a temporary message to show the user that the scenario was submitted
        setTempMessage("Scenario submitted succesfully ✅");

        // Clear the temp-message after 3 seconds
        setTimeout(() => setTempMessage(""), 3000);
        setFutureScenario("");
      } catch (error) {
        console.error("Future scenario submission error:", error);
        setTempMessage("⚠️ Error submitting scenario!");
      }
    }
  };

  const handleReset = () => {
    setCsvLoaded(false);
    setFutureScenario("");
  };

  return (
    <div className="card active">
      {/* Move LikertChartContainer to the top */}
      <LikertChartContainer chartsData={response || []} />

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
          {/* "Add Another Query" Button - Disabled Until CSV is Provided */}
          <button
            onClick={handleReset}
            className="likert-question-submit-button"
            disabled={!csvLoaded} /* Disable button until CSV is uploaded */
          >
            Add another query
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
            disabled={futureScenario.length < 5}
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

      {/* Loading Indicator (Appears on Top) */}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default AddQuery;
