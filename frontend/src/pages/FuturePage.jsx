import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import InitialDistribution from "../components/InitialDistribution";
import LikertChartContainer from "../components/LikertChartContainer";
import CsvUpload from "../components/CsvUpload";
import CsvDownload from "../components/CsvDownload";

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
  const [chartType, setChartType] = useState("initial");
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

  const handleSubmitScenario = () => {
    console.log("Submitted scenario:", futureScenario);
    setSubmittedScenario(futureScenario);
  };

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
    return <InitialDistribution data={agents} />;
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center space-y-12">
      {/* Title */}
      <h1 className="text-lg sm:text-xl font-semibold text-white-400">
        Future View
      </h1>

      {/* Main Content */}
      <div className="flex flex-row w-full gap-8">
        {/* Left side: Chart and Controls */}
        <div className="flex-1 flex flex-col items-start gap-4">
          {/* Chart Type Toggle Buttons and Help Icon */}
          <div className="flex gap-4 items-center mb-2">
            <button
              onClick={() => setChartType("initial")}
              className={`${chartType === "initial" ? "bg-blue-600" : "bg-gray-700"} rounded-md px-4 py-2 text-sm sm:text-base transition-colors`}
            >
              Demographic Distribution
            </button>

            <div className="relative group">
              <button
                onClick={() => csvLoaded && setChartType("likert")}
                disabled={!csvLoaded}
                aria-describedby="csv-tip"
                className={`rounded-md px-4 py-2 text-sm sm:text-base transition-colors
                  ${!csvLoaded ? "bg-gray-700 opacity-50 cursor-not-allowed" : chartType === "likert" ? "bg-blue-600" : "bg-gray-700"}`}
              >
                Future Scenario Answers
              </button>

              {/* Tooltip if CSV not loaded */}
              {!csvLoaded && (
                <span
                  id="csv-tip"
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2
                    mb-2 whitespace-nowrap text-xs sm:text-sm bg-gray-800 text-white px-3 py-2 rounded-md shadow-md
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Please provide CSV questions and a Future scenario first
                </span>
              )}
            </div>

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
                    w-[90vw] max-w-md bg-gray-800 text-white p-4 rounded-xl shadow-xl border border-gray-700 text-sm leading-relaxed z-50"
                >
                  <p>
                    Toggle between demographic distribution and simulated future
                    answers here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chart Display */}
          <div className="w-full max-w-[70vw]">{renderChart()}</div>
        </div>

        {/* Right side: CSV, Scenario Input, Submit */}
        <div className="w-1/3 flex flex-col items-center gap-6">
          <CsvUpload
            onCsvError={handleCsvError}
            onCsvSuccess={handleCsvSuccess}
            handleCsvSubmit={handleCsvSubmit}
          />

          <CsvDownload />

          <input
            type="text"
            placeholder="Enter future scenario..."
            className="w-full p-2 border border-gray-700 bg-gray-800 rounded text-white placeholder-gray-400"
            value={futureScenario}
            onChange={(e) => setFutureScenario(e.target.value)}
          />

          <button
            onClick={handleSubmitScenario}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
          >
            Submit Scenario
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuturePage;
