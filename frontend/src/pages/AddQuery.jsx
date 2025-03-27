import React, { useState } from "react";
import Title from "../components/Title";
import CsvUpload from "../components/CsvUpload";
import LoadingIndicator from "../components/LoadingIndicator";
import LikertChartContainer from "../components/LikertChartContainer";

const AddQuery = ({ handleCsvSubmit, isLoading, showMessage, response }) => {
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [futureScenario, setFutureScenario] = useState("");
  const [tempMessage, setTempMessage] = useState("");
  // const [questions, setQuestions] = useState([]);

  const handleCsvSuccess = (message) => {
    showMessage("success", message);
    setCsvLoaded(true);
  };

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
        const data = await response.json();
        console.log("Future scenario return data:", data);

        // Set a temporary message to show the user that the scenario was submitted
        setTempMessage("Scenario submitted succesfully");

        // Clear the temp-message after 3 seconds
        setTimeout(() => setTempMessage(""), 3000);
        setFutureScenario("");
      } catch (error) {
        console.error("Future scenario submission error:", error);
        showMessage("error", "⚠️ Could not submit the future scenario");
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
        {/* CSV Upload Section - Always Visible */}
        <div className="csv-upload-section">
          <Title className="csv-upload-title" text={"CSV-Upload"} />
          <p>
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
            className="likert-submit-button"
            disabled={!csvLoaded} /* Disable button until CSV is uploaded */
          >
            Add another query
          </button>
        </div>

        {/* Future Scenario Input */}
        <div className="future-scenario-input-container">
          <Title
            id="futureScenarioTitle"
            className="card-header"
            text={"Future Scenario"}
          />
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
              className="temp-message"
              style={{
                position: "absolute",
                marginBottom: "30px",
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
