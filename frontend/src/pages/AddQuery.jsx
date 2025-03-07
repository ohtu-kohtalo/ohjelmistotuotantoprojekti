import React, { useState } from "react";
import Title from "../components/Title";
import CsvUpload from "../components/CsvUpload";
import LoadingIndicator from "../components/LoadingIndicator";
import LikertChartContainer from "../components/LikertChartContainer";

const mockData = [
  {
    question: "Mitä olet mieltä kysymyksestä 1?",
    data: [
      { label: "Strongly Disagree", value: 10 },
      { label: "Disagree", value: 20 },
      { label: "Neutral", value: 30 },
      { label: "Agree", value: 25 },
      { label: "Strongly Agree", value: 15 },
    ],
  },
  {
    question: "Mitä olet mieltä kysymyksestä 2?",
    data: [
      { label: "Strongly Disagree", value: 5 },
      { label: "Disagree", value: 15 },
      { label: "Neutral", value: 35 },
      { label: "Agree", value: 30 },
      { label: "Strongly Agree", value: 15 },
    ],
  },
];

const AddQuery = ({ handleCsvSubmit, isLoading, showMessage }) => {
  const [csvLoaded, setCsvLoaded] = useState(false);

  const handleCsvSuccess = (message) => {
    showMessage("success", message);
    setCsvLoaded(true);
  };

  const handleCsvError = (errorMessage) => {
    showMessage("error", errorMessage);
    setCsvLoaded(false);
  };

  return (
    <div className="card">
      <Title className="card-header" text={"Upload CSV File"} />
      {csvLoaded ? (
        <LikertChartContainer chartsData={mockData} />
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
