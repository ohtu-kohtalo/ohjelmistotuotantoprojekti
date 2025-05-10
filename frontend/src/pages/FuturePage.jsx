/**
 * @file FuturePage.jsx
 *
 * High-level “scenario builder” view that stitches together multiple components:
 * InitialDistribution – helps display demographic histograms for the agent pool.
 * LikertChartContainer – helps display present-day and future scenario Likert charts.
 * CsvUpload & CsvDownload – I/O.
 * A text area + button for submitting a future scenario to the backend.
 * Inline help pop-ups (modals), success / error messages, and a blocking loading indicator.
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

import React, { useState } from "react";
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

  /**
   * Handles the submission of a future scenario. Validates the scenario length,
   * prompts the user for confirmation if a CSV file is loaded, and sends the scenario
   * to the backend for processing. Displays success or error messages based on the outcome.
   *
   * @async
   * @function handleFutureSubmit
   * @returns {Promise<void>} Resolves when the submission process is complete.
   *
   * @throws {Error} Throws an error if the backend request fails.
   *
   * @description
   * - If the `futureScenario` length is less than 5, the function does nothing.
   * - If a CSV file is loaded, the user is prompted with a confirmation dialog.
   * - Resets the response, clears the input field, and sets the loading state.
   * - Sends the scenario to the backend endpoint `/receive_future_scenario`.
   * - Displays a success message if the request is successful.
   * - Displays an error message if the request fails.
   * - Resets the loading state after the process is complete.
   */
  const handleFutureSubmit = async () => {
    if (futureScenario.length >= 5) {
      if (csvLoaded) {
        const ok = window.confirm(
          "Submitting a future scenario will reset the currently loaded CSV-file." +
            " You must re-enter the CSV-file in order to see the Future answers. Proceed?",
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
          "⚠️ Error deploying scenario! Message: " + error.message,
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
    // Main Div
    <div className="min-h-screen w-full bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center space-y-12">
      {/* Always Visible Content */}
      <div className="flex flex-col w-full gap-8">
        {/* Top Buttons */}
        <div className="flex gap-4 items-center mb-2">
          <button
            onClick={() => setChartType("initial")}
            className={`${chartType === "initial" ? "bg-blue-600" : "bg-gray-700"} rounded-md px-4 py-2 text-sm sm:text-base transition-all duration-1000 transform hover:scale-105 disabled:scale-95 cursor-pointer`}
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
            {/* Tooltip if CSV not loaded End */}
          </div>
          {/* Present Answers Button End */}

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
            {/* Future Scenario Answers Button End */}

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
              {/* ❓ CSV Loaded End */}

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
              {/* 📝 Future Scenario End */}
            </div>
            {/* Checkboxes with icons on top End */}

            {/* Help Icon For Top Buttons */}
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

              {/* Floating Modal for Top Buttons*/}
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
              {/* Floating Modal For Top Buttons End */}
            </div>
            {/* Help Icon For Top Buttons End */}
          </div>
          {/* Future Scenario Answers Button + Checkboxes + Help End */}
        </div>
        {/* Top Buttons End */}

        {/* Chart and Upload/Download/Scenario Section */}
        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-6 lg:gap-8">
          {/* Chart Container For Data Visualisation */}
          <div className="order-2 md:order-1 flex-1 flex flex-col items-start gap-4">
            <div className="w-full lg:max-w-[70vw] xl:max-w-[75vw] 2xl:max-w-[80vw]">
              {renderChart()}
            </div>
          </div>
          {/* Chart Container For Data Visualisation End*/}

          {/* Upload/Download/Scenario Section*/}
          <div className="order-1 md:order-2 w-full md:w-72 lg:w-80 xl:w-96 2xl:w-[28rem] flex flex-col items-center gap-8 mt-2">
            {/* Buttons Above Scenario Input */}
            <div className="w-full flex flex-row items-center justify-center gap-4">
              {/* Help Icon For Upload/Download/Scenario*/}
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
                {/* Help Icon For Upload/Download/Scenario Button Styling End */}

                {/* Floating Modal For Upload/Download/Scenario Help Icon*/}
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
                      scenario…” field, type at least 5 characters (and a
                      maximum of 10,000 tokens, roughly 7,500 words) describing
                      a “what-if” (e.g. “Resource prices surge”), then click
                      Submit 🔓 to simulate how agent responses might change. If
                      you do not want to provide your own future scenario, you
                      can type "default" in the field and the application will
                      use a default future scenario concerning techological
                      advancements in the production of cultured meat.
                    </li>
                  </ul>
                </div>
                {/* Floating Modal For Upload/Download/Scenario Help Icon End */}
              </div>

              <CsvUpload
                onCsvError={handleCsvError}
                onCsvSuccess={handleCsvSuccess}
                handleCsvSubmit={handleCsvSubmit}
              />

              <CsvDownload />
            </div>
            {/* Buttons Above Scenario Input End */}

            {/* Future Scenario Input Area*/}
            <textarea
              placeholder="Enter future scenario..."
              className="w-full p-6 h-[250px] border border-gray-700 bg-gray-800 rounded text-white placeholder-gray-400 resize-none"
              value={futureScenario}
              onChange={(e) => setFutureScenario(e.target.value)}
            />
            {/* Future Scenario Input Area End */}

            {/* Future Scenario Submit Button */}
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
            {/* Future Scenario Submit Button End*/}

            {/* Back to Index Page Button */}
            <button
              onClick={handleGoBack}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 min-w-[8rem] text-white py-3 rounded-md bg-blue-600 hover:bg-blue-700 transform transition-all duration-1000 hover:scale-105 disabled:scale-95 cursor-pointer whitespace-nowrap"
            >
              ⬅️ Go Back
            </button>
            {/* Back to Index Page Button End */}
          </div>
          {/* Upload/Download/Scenario Section End */}
        </div>
        {/* Chart and Upload/Download/Scenario Section End */}
      </div>
      {/* Always Visible Content End */}

      {/* Loading Indicator */}
      {(futureScenarioLoading || isLoading) && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center
               pointer-events-auto overflow-hidden"
        >
          <LoadingIndicator />
        </div>
      )}
      {/* Loading Indicator End */}

      {/* Full-screen Message overlay */}
      {!futureScenarioLoading && !isLoading && message.text && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="text-lg px-8 py-6 max-w-lg w-full text-center mx-4">
            {message.text}
          </div>
        </div>
      )}
      {/* Full-screen Message overlay End */}
    </div>
    // Main Div End
  );
};

export default FuturePage;
