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
        //console.log("response.ok", response.ok);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        // The returned data is a status message {status: "success"}
        const data = await response.json();
        console.log("Future scenario return data:", data);

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
    // setQuestions([]);
  };

  // const handleAddQuestion = () => {
  //   const questionInput = document.getElementById("quickAddQuestion").value;
  //   if (questionInput) {
  //     setQuestions([...questions, questionInput]);
  //     document.getElementById("quickAddQuestion").value = "";
  //   }
  // };

  // const handleSubmitQuestions = () => {
  //   console.log("Submitted questions:", questions);
  // };

  return (
    <div className="card active">
      {/* Move LikertChartContainer to the top */}
      <LikertChartContainer chartsData={response || []} />

      <div className="query-input-container">
        {/* Quick Add Section */}
        {/* <div className="quick-add-question-container"> */}
        {/* <div className="quick-add-question">
            <label htmlFor="quickAddQuestion">Quick Add Question:</label>
            <input
              type="text"
              id="quickAddQuestion"
              name="quickAddQuestion"
              placeholder="Type your question here"
            />
            <button onClick={handleAddQuestion}>Add</button>
          </div> */}

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
            placeholder="Enter future scenario"
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

        {/* List of added questions */}
        {/* <ul className="question-list">
            {questions.map((question, index) => (
              <li key={index} className="question-item">
                {question}
              </li>
            ))}
          </ul> */}

        {/* Submit Questions Button */}
        {/* <button
            className="question-submit-button"
            onClick={handleSubmitQuestions}
            disabled={questions.length === 0}
          >
            Submit
          </button> */}
        {/* </div> */}
        {/* CSV Upload Section - Always Visible */}
        <div className="csv-upload-section">
          <Title id="CSV-file-title" className="card-header" text={""} />
          <p>
            You can also upload a CSV file with questions on it. The correct
            format for the file is one question per row in the first column.
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
