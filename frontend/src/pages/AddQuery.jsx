import React, { useState } from "react";
import Title from "../components/Title";
import CsvUpload from "../components/CsvUpload";
import LoadingIndicator from "../components/LoadingIndicator";
import LikertChartContainer from "../components/LikertChartContainer";

const AddQuery = ({ handleCsvSubmit, isLoading, showMessage, response }) => {
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleCsvSuccess = (message) => {
    showMessage("success", message);
    setCsvLoaded(true);
  };

  const handleCsvError = (errorMessage) => {
    showMessage("error", errorMessage);
    setCsvLoaded(false);
  };

  const handleAddQuestion = () => {
    const questionInput = document.getElementById("quickAddQuestion").value;
    if (questionInput) {
      setQuestions([...questions, questionInput]);
      document.getElementById("quickAddQuestion").value = "";
    }
  };

  const handleSubmitQuestions = () => {
    console.log("Submitted questions:", questions);
  };

  const handleReset = () => {
    setCsvLoaded(false);
    setQuestions([]);
  };

  return (
    <div className="card active">
      {/* Move LikertChartContainer to the top */}
      <LikertChartContainer chartsData={response || []} />

      <div className="query-input-container">
        {/* Quick Add Section */}
        <div className="quick-add-question-container">
          <div className="quick-add-question">
            <label htmlFor="quickAddQuestion">Quick Add Question:</label>
            <input
              type="text"
              id="quickAddQuestion"
              name="quickAddQuestion"
              placeholder="Type your question here"
            />
            <button onClick={handleAddQuestion}>Add</button>
          </div>

          {/* List of added questions */}
          <ul className="question-list">
            {questions.map((question, index) => (
              <li key={index} className="question-item">
                {question}
              </li>
            ))}
          </ul>

          {/* Submit Questions Button */}
          <button
            className="question-submit-button"
            onClick={handleSubmitQuestions}
            disabled={questions.length === 0}
          >
            Submit
          </button>
        </div>
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
