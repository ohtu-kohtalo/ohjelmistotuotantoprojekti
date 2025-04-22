import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import InitialDistribution from "../components/InitialDistribution";
import LikertChartContainer from "../components/LikertChartContainer";
import CsvUpload from "../components/CsvUpload";
import CsvDownload from "../components/CsvDownload";
import LoadingIndicator from "../components/LoadingIndicator";

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
  const [showChartHelp, setShowChartHelp] = useState(false);
  const [showUploadHelp, setShowUploadHelp] = useState(false);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [futureScenario, setFutureScenario] = useState("");
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

  const handleReset = () => {
    setCsvLoaded(false);
    setCsvUploaded(false);
    setFutureScenario("");
    resetResponse();
  };

  const handleFutureSubmit = async () => {
    if (futureScenario.length >= 5) {
      resetResponse();
      const helperFutureScenario = futureScenario;

      showMessage("Scenario submitted 📨");
      setFutureScenarioLoading(true);
      setSubmittedScenario(futureScenario); // ✅ Shared state update
      setFutureScenario(""); // Clear input field

      try {
        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
        const response = await fetch(`${BACKEND_URL}/receive_future_scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario: helperFutureScenario }),
        });

        console.log("Submitted Future Scenario:", helperFutureScenario);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Future scenario return data:", data);

        showMessage("success", "Scenario deployed successfully ✅");
        handleReset();
      } catch (error) {
        console.error("Future scenario submission error:", error);
        showMessage("error", "⚠️ Error deploying scenario!");
      } finally {
        setFutureScenarioLoading(false);
      }
    }
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
      {/* Main Content */}
      <div className="flex flex-col w-full gap-8">
        {/* Top Buttons */}
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

          {/* Help Icon for Chart Switching */}
          <div
            onMouseEnter={() => setShowChartHelp(true)}
            onMouseLeave={() => setShowChartHelp(false)}
            className="relative"
          >
            <button
              aria-label="Explain Future Page"
              className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-md text-xl font-bold cursor-pointer"
            >
              ?
            </button>

            {showChartHelp && (
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

        {/* Chart and Upload Section */}
        <div className="flex flex-row w-full gap-8">
          {/* Left side: Chart */}
          <div className="flex-1 flex flex-col items-start gap-4">
            <div className="w-full max-w-[70vw]">{renderChart()}</div>
          </div>

          {/* Right side: Upload/Download/Scenario */}
          <div className="w-[400px] flex flex-col items-center gap-8 mt-2">
            {/* Upload/Download/Help Section */}
            <div className="w-full flex flex-row items-center justify-center gap-4">
              {/* Help Icon for Upload/Download/Scenario */}
              <div
                onMouseEnter={() => setShowUploadHelp(true)}
                onMouseLeave={() => setShowUploadHelp(false)}
                className="relative"
              >
                <button
                  aria-label="Explain Upload/Download/Scenario"
                  className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-md text-xl font-bold cursor-pointer"
                >
                  ?
                </button>

                {showUploadHelp && (
                  <div
                    className="absolute bottom-[3.5rem] left-1/2 -translate-x-1/2
                      w-[90vw] max-w-md bg-gray-800 text-white p-4 rounded-xl shadow-xl border border-gray-700 text-sm leading-relaxed z-50"
                  >
                    <p>
                      <strong>Upload CSV:</strong> Upload your prepared question
                      file here.
                      <br />
                      <br />
                      <strong>Download CSV:</strong> Download a template or your
                      existing file.
                      <br />
                      <br />
                      <strong>Submit Future Scenario:</strong> Enter a future
                      scenario after uploading questions.
                    </p>
                  </div>
                )}
              </div>

              {/* Upload CSV */}
              <CsvUpload
                onCsvError={handleCsvError}
                onCsvSuccess={handleCsvSuccess}
                handleCsvSubmit={handleCsvSubmit}
              />

              {/* Download CSV */}
              <CsvDownload />
            </div>

            {/* Future Scenario Input */}
            <textarea
              placeholder="Enter future scenario..."
              className="w-full p-6 h-[250px] border border-gray-700 bg-gray-800 rounded text-white placeholder-gray-400 resize-none"
              value={futureScenario}
              onChange={(e) => setFutureScenario(e.target.value)}
            />

            {/* Submit Button */}
            <button
              onClick={handleFutureSubmit}
              className={`w-full text-white py-3 rounded-md transition
                ${
                  futureScenario.length < 5 || futureScenarioLoading
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={futureScenario.length < 5 || futureScenarioLoading}
            >
              Submit {futureScenario.length < 5 ? "🔒" : "🔓"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay during Future Scenario submit */}
      {(futureScenarioLoading || isLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default FuturePage;
