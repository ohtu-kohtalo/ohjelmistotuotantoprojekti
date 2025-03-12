import React, { useState } from "react";
import Title from "../components/Title";
import CsvUpload from "../components/CsvUpload";
import LoadingIndicator from "../components/LoadingIndicator";
import LikertChartContainer from "../components/LikertChartContainer";

// const mockData = [
//   {
//     question: "Mitä olet mieltä kysymyksestä 1?",
//     data: [
//       { label: "Strongly Disagree", value: 10 },
//       { label: "Disagree", value: 20 },
//       { label: "Neutral", value: 30 },
//       { label: "Agree", value: 25 },
//       { label: "Strongly Agree", value: 15 },
//     ],
//   },
//   {
//     question: "Mitä olet mieltä kysymyksestä 2?",
//     data: [
//       { label: "Strongly Disagree", value: 5 },
//       { label: "Disagree", value: 15 },
//       { label: "Neutral", value: 35 },
//       { label: "Agree", value: 30 },
//       { label: "Strongly Agree", value: 15 },
//     ],
//   },
// ];

const AddQuery = ({ handleCsvSubmit, isLoading, showMessage, response }) => {
  const [csvLoaded, setCsvLoaded] = useState(false);

  const handleCsvSuccess = (message) => {
    showMessage("success", message);
    setCsvLoaded(true);
  };

  const handleCsvError = (errorMessage) => {
    showMessage("error", errorMessage);
    setCsvLoaded(false);
  };

  const [questions, setQuestions] = useState([]);

  const handleAddQuestion = () => {
    const questionInput = document.getElementById("quickAddQuestion").value;
    if (questionInput) {
      setQuestions([...questions, questionInput]);
      document.getElementById("quickAddQuestion").value = "";
    }
  };

  const handleSubmitQuestions = () => {
    // Logic to handle the submission of questions
    console.log("Submitted questions:", questions);
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
            <p>{question}</p>
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
      {csvLoaded ? (
        <LikertChartContainer chartsData={response} />
      ) : (
        <CsvUpload
          onCsvError={handleCsvError}
          onCsvSuccess={handleCsvSuccess}
          handleCsvSubmit={handleCsvSubmit}
        />
      )}
      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default AddQuery;
