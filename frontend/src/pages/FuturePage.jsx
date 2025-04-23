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
      setSubmittedScenario(futureScenario);
      setFutureScenario("");

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
      <div className="flex flex-col w-full gap-8">
        {/* Top Buttons */}
        <div className="flex gap-4 items-center mb-2">
          <button
            onClick={() => setChartType("initial")}
            className={`${chartType === "initial" ? "bg-blue-600" : "bg-gray-700"} rounded-md px-4 py-2 text-sm sm:text-base transition-colors`}
          >
            Demographic Distribution
          </button>

          {/* Future Scenario Answers Button + Checkboxes + Help */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button
                onClick={() =>
                  csvLoaded && submittedScenario && setChartType("likert")
                }
                disabled={!csvLoaded || !submittedScenario}
                className={`rounded-md px-4 py-2 text-sm sm:text-base transition-colors
                  ${
                    !csvLoaded || !submittedScenario
                      ? "bg-gray-700 opacity-50 cursor-not-allowed"
                      : chartType === "likert"
                        ? "bg-blue-600"
                        : "bg-gray-700"
                  }`}
              >
                Future Scenario Answers
              </button>

              {(!csvLoaded || !submittedScenario) && (
                <span
                  id="csv-tip"
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap text-xs sm:text-sm bg-gray-800 text-white px-3 py-2 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {!csvLoaded && !submittedScenario
                    ? "Please upload CSV and submit a future scenario first"
                    : !csvLoaded
                      ? "Please upload a CSV of questions first"
                      : "Please submit a future scenario first"}
                </span>
              )}
            </div>

            {/* Checkboxes with icons on top */}
            <div className="flex items-center gap-2">
              {/* ❓ CSV Loaded */}
              <div className="flex flex-col items-center text-xs text-gray-300 space-y-1">
                <span>❓</span>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center text-lg
                    ${csvLoaded ? "bg-green-600 border-green-400 text-white" : "bg-gray-800 border-gray-600"}`}
                >
                  {csvLoaded ? "✅" : ""}
                </div>
              </div>

              {/* 📝 Future Scenario */}
              <div className="flex flex-col items-center text-xs text-gray-300 space-y-1">
                <span>📝</span>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center text-lg
                    ${submittedScenario ? "bg-green-600 border-green-400 text-white" : "bg-gray-800 border-gray-600"}`}
                >
                  {submittedScenario ? "✅" : ""}
                </div>
              </div>
            </div>

            {/* Help Icon */}
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
                <div className="absolute top-[3.5rem] left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-gray-800 text-white p-4 rounded-xl shadow-xl border border-gray-700 text-sm leading-relaxed z-50">
                  <p>
                    Toggle between demographic distribution and simulated future
                    answers here. Icons next to the buttons indicate the status
                    of your CSV upload and future scenario submission. When both
                    are submitted, you can view the simulated future answers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart and Upload Section */}
        <div className="flex flex-row w-full gap-8">
          <div className="flex-1 flex flex-col items-start gap-4">
            <div className="w-full max-w-[70vw]">{renderChart()}</div>
          </div>

          <div className="w-[400px] flex flex-col items-center gap-8 mt-2">
            <div className="w-full flex flex-row items-center justify-center gap-4">
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
                  <div className="absolute top-[3.5rem] left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-gray-800 text-white p-4 rounded-xl shadow-xl border border-gray-700 text-sm leading-relaxed z-50">
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

              <CsvUpload
                onCsvError={handleCsvError}
                onCsvSuccess={handleCsvSuccess}
                handleCsvSubmit={handleCsvSubmit}
              />

              <CsvDownload />
            </div>

            <textarea
              placeholder="Enter future scenario..."
              className="w-full p-6 h-[250px] border border-gray-700 bg-gray-800 rounded text-white placeholder-gray-400 resize-none"
              value={futureScenario}
              onChange={(e) => setFutureScenario(e.target.value)}
            />

            <button
              onClick={handleFutureSubmit}
              className={`w-full text-white py-3 rounded-md transition ${
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
      {(futureScenarioLoading || isLoading) && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center
               pointer-events-auto overflow-hidden"
        >
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default FuturePage;
