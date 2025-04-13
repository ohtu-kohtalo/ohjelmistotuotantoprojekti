import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import CsvUpload from "../components/CsvUpload";
import LoadingIndicator from "../components/LoadingIndicator";
import LikertChartContainer from "../components/LikertChartContainer";
import InitialDistribution from "./InitialDistribution";

/**
 * PresentPage Component
 *
 * This component allows users to:
 * - View initial demographic distributions
 * - Upload a CSV file containing questions
 * - View Likert-scale visualizations and basic stats
 *
 * @param {Object} props
 * @param {Array<Object>} [props.data=[]] - Array of agent data objects. Each object may contain properties such as `age` (number or string) and `gender` (string).
 * @param {Function} props.handleCsvSubmit - Callback for CSV submission.
 * @param {boolean} props.isLoading - Whether loading state is active.
 * @param {Function} props.showMessage - Function to show toast messages.
 * @param {Array} props.response - Current Likert data.
 * @param {Function} props.setCsvUploaded - Notifies that CSV was uploaded.
 *
 * @returns {JSX.Element}
 */

const PresentPage = ({
  handleCsvSubmit,
  isLoading,
  showMessage,
  response,
  setCsvUploaded,
}) => {
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();
  const agents = location.state?.agents ?? [];

  const handleCsvSuccess = (message) => {
    showMessage("success", message);
    setCsvLoaded(true);
  };

  const handleCsvError = (errorMessage) => {
    showMessage("error", errorMessage);
    setCsvLoaded(false);
  };

  return (
    <div className="flex w-full gap-4">
      {/* Left section for Initial Distribution */}
      <div className="flex-1">
        <InitialDistribution data={agents} />
      </div>

      {/* Right section for LikertChartContainer and CSV Upload */}
      <div className="flex-1">
        <LikertChartContainer chartsData={response || []} />

        <div className="mt-5">
          <p className="text-lg mt-12 max-w-2xl mx-auto leading-relaxed">
            Upload a CSV file with questions on it. Correct format for the file
            is one question per row in the first column.
          </p>
          <CsvUpload
            onCsvError={handleCsvError}
            onCsvSuccess={handleCsvSuccess}
            handleCsvSubmit={handleCsvSubmit}
          />
        </div>
      </div>

      {/* Overlay Loading Indicators */}
      {isLoading && (
        <div className="loading-overlay absolute inset-0 bg-gray-600 opacity-50 flex justify-center items-center">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default PresentPage;
