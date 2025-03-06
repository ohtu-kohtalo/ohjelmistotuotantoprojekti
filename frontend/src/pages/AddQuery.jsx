import React from "react";
import Title from "../components/Title";
import CsvUpload from "../components/CsvUpload";
import ChatContainer from "../components/ChatContainer";
import LoadingIndicator from "../components/LoadingIndicator";

const AddQuery = ({ handleCsvSubmit, isLoading, response, showMessage }) => (
  <div className="card">
    <Title className="card-header" text={"Upload CSV File"} />
    <CsvUpload
      onCsvError={(errorMessage) => showMessage("error", errorMessage)}
      onCsvSuccess={(successMessage) => showMessage("success", successMessage)}
      handleCsvSubmit={handleCsvSubmit}
    />
    {isLoading && <LoadingIndicator />}
    <ChatContainer response={response} />
  </div>
);

export default AddQuery;
