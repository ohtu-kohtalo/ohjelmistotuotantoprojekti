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

      <ul>
        {questions.map((question, index) => (
          <li key={index}>
            <p className="question">{question}</p>
          </li>
        ))}
      </ul>

      <button
        className="question-submit-button"
        onClick={handleSubmitQuestions}
        disabled={questions.length === 0}
      >
        Submit Questions
      </button>

      <Title
        id="CSV-file-title"
        className="card-header"
        text={"Upload CSV File"}
      />
      {!csvLoaded && (
        <CsvUpload
          onCsvError={handleCsvError}
          onCsvSuccess={handleCsvSuccess}
          handleCsvSubmit={handleCsvSubmit}
        />
      )}
      <>
        <LikertChartContainer chartsData={response || []} />
        <div className="likert-submit-button-container">
          <button onClick={handleReset} className="likert-submit-button">
            Add another query
          </button>
        </div>
      </>
      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default AddQuery;
