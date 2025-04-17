import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import InitialDistribution from "../components/InitialDistribution";
import LikertChartContainer from "../components/LikertChartContainer";
import CsvUpload from "../components/CsvUpload";

/**
 * FuturePage
 * Can now toggle between a Demographic chart and a Future‑scenario Likert chart.
 */
const FuturePage = ({
  handleCsvSubmit,
  isLoading,
  showMessage,
  response,
  futureResponse,
  resetResponse,
  setCsvUploaded,
  submittedScenario,
  setSubmittedScenario,
}) => {
  const [chartType, setChartType] = useState("initial"); // "initial" | "likert"
  const [showHelp, setShowHelp] = useState(false);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [futureScenario, setFutureScenario] = useState("");
  const [tempMessage, setTempMessage] = useState("");
  const [futureScenarioLoading, setFutureScenarioLoading] = useState(false);
  const tempMessageTimeout = useRef(null);
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

  /**
   * Renders the selected chart type.
   */
  const renderChart = () => {
    if (chartType === "likert") {
      return (
        <LikertChartContainer
          chartsData={response || []}
          futureData={futureResponse || []}
          submittedScenario={submittedScenario || ""}
        />
      );
    }

    // Default: initial distribution
    return <InitialDistribution data={agents} />;
  };

  return (
    <div
      className="min-h-screen w-full bg-gray-900 text-white
                    px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center space-y-12"
    >
      {/* Title */}
      <h1 className="text-lg sm:text-xl font-semibold text-white-400 mt-12">
        Future View
      </h1>

      {/* Chart Toggle */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setChartType("initial")}
          className={`${chartType === "initial" ? "bg-blue-600" : "bg-gray-700"}
                      rounded-md px-4 py-2 text-sm sm:text-base transition-colors`}
        >
          Demographic Distribution
        </button>

        {/* Future‑scenario button with tooltip */}
        <div className="relative group">
          <button
            onClick={() => csvLoaded && setChartType("likert")}
            disabled={!csvLoaded}
            aria-describedby="csv-tip"
            className={`rounded-md px-4 py-2 text-sm sm:text-base transition-colors
        ${
          !csvLoaded
            ? "bg-gray-700 opacity-50 cursor-not-allowed"
            : chartType === "likert"
              ? "bg-blue-600"
              : "bg-gray-700"
        }`}
          >
            Future Scenario Answers
          </button>

          {/* Tooltip (shows only while disabled) */}
          {!csvLoaded && (
            <span
              id="csv-tip"
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2
          mb-2 whitespace-nowrap text-xs sm:text-sm
          bg-gray-800 text-white px-3 py-2 rounded-md shadow-md
          opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Please provide CSV&nbsp;questions and a future scenario first
            </span>
          )}
        </div>
      </div>

      {/* Combined Chart Container */}
      <div className="w-full max-w-[70vw] mx-auto flex flex-col items-center">
        {renderChart()}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <CsvUpload
          onCsvError={handleCsvError}
          onCsvSuccess={handleCsvSuccess}
          handleCsvSubmit={handleCsvSubmit}
        />
        <button
          className="w-40 bg-gray-800 hover:bg-gray-700 text-white
                           font-medium py-2 px-6 rounded-lg shadow-md transition"
        >
          Download
        </button>

        {/* Help Icon */}
        <div
          onMouseEnter={() => setShowHelp(true)}
          onMouseLeave={() => setShowHelp(false)}
          className="relative"
        >
          <button
            aria-label="Explain Future Page"
            className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-md text-xl font-bold cursor-pointer"
          >
            ?
          </button>

          {showHelp && (
            <div
              className="absolute bottom-[3.5rem] left-1/2 -translate-x-1/2
                            w-[90vw] max-w-md bg-gray-800 text-white p-4 rounded-xl
                            shadow-xl border border-gray-700 text-sm leading-relaxed z-50"
            >
              <p>
                Toggle between demographic distribution and simulated future
                answers here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuturePage;
