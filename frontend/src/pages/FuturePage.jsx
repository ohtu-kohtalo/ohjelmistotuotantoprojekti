/**
 * @file FuturePage.jsx
 *
 * High-level “scenario builder” view that stitches together multiple components:
 * InitialDistribution – demographic histograms for the agent pool.
 * LikertChartContainer – present-day and scenario Likert charts.
 * CsvUpload & CsvDownload – statement I/O.
 * A text area + button for submitting a future scenario to the backend.
 * Inline help pop-ups, success / error messages, and a blocking loading indicator.
 *
 * Props
 * -----
 * @prop {Function}  handleCsvSubmit      – Called with parsed statement list.
 * @prop {Boolean}   isLoading            – Global loading flag.
 * @prop {Function}  showMessage          – `(type, text)` toast helper for correct message displaying.
 * @prop {Array}     response             – Present Likert data from backend.
 * @prop {Array}     futureResponse       – Future Likert data from backend.
 * @prop {Function}  resetResponse        – Clears both `response` arrays.
 * @prop {Function}  setCsvUploaded       – Lifts CSV-loaded flag to parent.
 * @prop {String}    submittedScenario    – Last scenario successfully POSTed.
 * @prop {Function}  setSubmittedScenario – Setter for same.
 * @prop {{text:string}} message          – Toast overlay content.
 *
 * @module FuturePage
 */

import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  message,
}) => {
  const [chartType, setChartType] = useState("initial");
  const [showChartHelp, setShowChartHelp] = useState(false);
  const [showUploadHelp, setShowUploadHelp] = useState(false);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [futureScenario, setFutureScenario] = useState("");
  const [futureScenarioLoading, setFutureScenarioLoading] = useState(false);
  const tempMessageTimeout = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
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

  // FIX THIS: This is a temporary solution to avoid the "double message" issue.
  // GO BACK BUTTON SHOULD RESET EVERYTHING
  const handleGoBack = () => {
    handleReset();
    navigate("/", { replace: true });
  };

  const handleFutureSubmit = async () => {
    if (futureScenario.length >= 5) {
      if (csvLoaded) {
        const ok = window.confirm(
          "Submitting a future scenario will reset the currently loaded CSV-file." +
            " You must re-enter the CSV-file in order to see the Future answers. Proceed?"
        );
        if (!ok) return; // User declined the confirmation
      }

      resetResponse();
      const helperFutureScenario = futureScenario;

      showMessage("Scenario submitted successfully 📨");
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

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        showMessage("success", "Scenario deployed successfully ✅");
        handleReset();
      } catch (error) {
        showMessage(
          "error",
          "⚠️ Error deploying scenario! Message: " + error.message
        );
      } finally {
        setFutureScenarioLoading(false);
      }
    }
  };

  const renderChart = () => {
    if (chartType === "likert-present") {
      return <LikertChartContainer chartsData={response || []} />;
    }

    if (chartType === "likert-future") {
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
            className={`${
              chartType === "initial" ? "bg-blue-600" : "bg-gray-700"
            } rounded-md px-4 py-2 text-sm sm:text-base transition-all duration-1000 transform hover:scale-105 disabled:scale-95 cursor-pointer`}
          >
            Demographic Distribution
          </button>

          {/* Present Answers Button */}
          <div className="relative group">
            <button
              onClick={() => csvLoaded && setChartType("likert-present")}
              disabled={!csvLoaded}
              aria-describedby="csv-tip"
              className={`rounded-md px-4 py-2 text-sm sm:text-base transition-all duration-1000 transform hover:scale-105 disabled:scale-95 cursor-pointer disabled:cursor-not-allowed
                ${
                  !csvLoaded
                    ? "bg-gray-700 opacity-50"
                    : chartType === "likert-present"
                      ? "bg-blue-600"
                      : "bg-gray-700"
                }`}
            >
              Present answers
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
                Please provide CSV statements first
              </span>
            )}
          </div>

          {/* Future Scenario Answers Button + Checkboxes + Help */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button
                onClick={() =>
                  csvLoaded &&
                  submittedScenario &&
                  setChartType("likert-future")
                }
                disabled={!csvLoaded || !submittedScenario}
                className={`rounded-md px-4 py-2 text-sm sm:text-base transition-all duration-1000 transform hover:scale-105 disabled:scale-95 cursor-pointer disabled:cursor-not-allowed
                  ${
                    !csvLoaded || !submittedScenario
                      ? "bg-gray-700 opacity-50"
                      : chartType === "likert-future"
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
                    ${
                      csvLoaded
                        ? "bg-green-600 border-green-400 text-white"
                        : "bg-gray-800 border-gray-600"
                    }`}
                >
                  {csvLoaded ? "✅" : ""}
                </div>
              </div>

              {/* 📝 Future Scenario */}
              <div className="flex flex-col items-center text-xs text-gray-300 space-y-1">
                <span>📝</span>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center text-lg
                    ${
                      submittedScenario
                        ? "bg-green-600 border-green-400 text-white"
                        : "bg-gray-800 border-gray-600"
                    }`}
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
                className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-md text-xl font-bold cursor-pointer transform transition-all duration-1000 hover:scale-105 disabled:scale-95"
              >
                ?
              </button>

              {/* Floating Modal */}
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="chart-help-title"
                className={`absolute top-[3.5rem] left-1/2 -translate-x-1/2 w-[70vw] sm:w-[50vw] max-w-screen-md bg-gray-800 text-white p-6 rounded-xl shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto transition-all duration-[600ms] ease-in-out transform ${
                  showChartHelp
                    ? "opacity-100 pointer-events-auto translate-y-0 z-50"
                    : "opacity-0 pointer-events-none translate-y-4 z-10"
                }`}
              >
                <h3
                  id="chart-help-title"
                  className="text-lg sm:text-xl font-semibold text-center mb-4"
                >
                  View Options
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed">
                  <li>
                    <strong>Demographic Distribution: </strong>
                    Bar charts showing the age or gender distribution of the
                    agents, toggled by the buttons on the top left of the chart.
                  </li>
                  <li>
                    <strong>Present Answers: </strong>
                    Once you’ve uploaded a CSV of statements, this renders a bar
                    graph of the Likert-scale answers for each statement,
                    letting you see how today’s customers respond on a 1–5
                    scale.
                  </li>
                  <li>
                    <strong>Future Scenario Answers: </strong>
                    After entering and submitting your “what-if” scenario, this
                    view shows side-by-side Likert charts of current vs.
                    predicted responses, so you can instantly spot shifts in
                    sentiment under your scenario.
                  </li>
                </ul>
                <p className="mt-3 text-sm">
                  Status icons next to these buttons indicate steps completed:
                  ❓ CSV loaded, 📝 scenario submitted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Upload Section */}
        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-6 lg:gap-8">
          <div className="order-2 md:order-1 flex-1 flex flex-col items-start gap-4">
            <div className="w-full lg:max-w-[70vw] xl:max-w-[75vw] 2xl:max-w-[80vw]">
              {renderChart()}
            </div>
          </div>

          <div className="order-1 md:order-2 w-full md:w-72 lg:w-80 xl:w-96 2xl:w-[28rem] flex flex-col items-center gap-8 mt-2">
            <div className="w-full flex flex-row items-center justify-center gap-4">
              <div
                onMouseEnter={() => setShowUploadHelp(true)}
                onMouseLeave={() => setShowUploadHelp(false)}
                className="relative"
              >
                <button
                  aria-label="Explain Upload/Download/Scenario"
                  className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-md text-xl font-bold cursor-pointer transform transition-all duration-1000 hover:scale-105 disabled:scale-95"
                >
                  ?
                </button>

                {/* Floating Modal */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="upload-help-title"
                  className={`absolute top-[3.5rem] right-1/2 w-[80vw] sm:w-[60vw] max-w-screen-md bg-gray-800 text-white p-6 rounded-xl shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto transition-all duration-[600ms] ease-in-out transform ${
                    showUploadHelp
                      ? "opacity-100 pointer-events-auto translate-y-0"
                      : "opacity-0 pointer-events-none translate-y-4"
                  }`}
                >
                  <h4
                    id="upload-help-title"
                    className="text-lg sm:text-xl font-semibold text-center mb-4"
                  >
                    Data Source
                  </h4>
                  <p className="text-xs mb-3">
                    Agents are based on VTT’s Gen Z food system survey — please
                    frame statements around sustainability and food consumption
                    topics.
                  </p>
                  <hr className="border-gray-700 mb-3" />

                  <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed">
                    <li>
                      <strong>Upload CSV:</strong> Click “Upload CSV” to import
                      your prepared statement file (
                      <em>no header row, one statement per row</em>). A green ✅
                      appears under the ❓ icon when accepted. The maximum
                      length of one statement is 200 characters and the maximum
                      number of statements at a time is 10. You can upload
                      multiple CSV files to add more statements. You can also
                      repeat statements.
                    </li>
                    <li>
                      <strong>Download CSV:</strong> Use “Download CSV” to
                      export your current statements and any loaded responses
                      for offline analysis.
                    </li>
                    <li>
                      <strong>Future Scenario:</strong> In the “Enter future
                      scenario…” field, type at least 5 characters describing a
                      “what-if” (e.g. “Resource prices surge”), then click
                      Submit 🔓 to simulate how agent responses might change.
                    </li>
                  </ul>
                </div>
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
              disabled={futureScenario.length < 5 || futureScenarioLoading}
              className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/4 min-w-[8rem] text-white py-3 rounded-md
              transform transition-all duration-1000 hover:scale-105 disabled:scale-95
              cursor-pointer disabled:cursor-not-allowed
              ${
                futureScenario.length < 5 || futureScenarioLoading
                  ? "bg-gray-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Submit {futureScenario.length < 5 ? "🔒" : "🔓"}
            </button>

            {/* Back to Index Page */}
            <button
              onClick={handleGoBack}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 min-w-[8rem] text-white py-3 rounded-md bg-blue-600 hover:bg-blue-700 transform transition-all duration-1000 hover:scale-105 disabled:scale-95 cursor-pointer whitespace-nowrap"
            >
              ⬅️ Go Back
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

      {/* Full-screen Message overlay AFTER loading */}
      {!futureScenarioLoading && !isLoading && message.text && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="text-lg px-8 py-6 max-w-lg w-full text-center mx-4">
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default FuturePage;
