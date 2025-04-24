import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import IndexPage from "./pages/IndexPage";
import FuturePage from "./pages/FuturePage";
import "./index.css";

const App = () => {
  const [hovering, setHovering] = useState(false);

  // Initial state for distributions + scenario
  const [distribution, setDistribution] = useState([]);
  const [futureDistribution, setFutureDistribution] = useState([]);
  const [submittedScenario, setSubmittedScenario] = useState("");

  // Initial states for response and error handling
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const messageTimeoutRef = useRef(null);

  // State for checking whether csv has been uploaded
  const [csvUploaded, setCsvUploaded] = useState(false);

  /**
   * Handles the submission of a CSV file containing questions to the backend.
   *
   * This function sends the provided questions to the backend as a JSON payload,
   * waits for the response, and updates the state accordingly.
   *
   * @param {Array} csvQuestions - An array of questions extracted from the CSV file.
   * @returns {Promise<void>} - A promise that resolves once the submission is processed.
   */
  const handleCsvSubmit = async (csvQuestions) => {
    setIsLoading(true);
    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
      const response = await fetch(`${BACKEND_URL}/receive_user_csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: csvQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // showMessage("success", "CSV submitted successfully! 📂👍");
      const data = await response.json();

      console.log("[DEBUG] Reached here #1");

      setDistribution(data.distributions);
      setFutureDistribution(data.future_distributions);

      if (data.future_distributions.length > 0) {
        console.log("[DEBUG] Reached here #2, with futureDistribution!");
      }

      setCsvUploaded(true);
    } catch (error) {
      console.error("CSV submission error:", error);
      // showMessage("error", "⚠️ Could not submit CSV data");
      setCsvUploaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to display error messages
  const showMessage = (type, text) => {
    setMessage({ type, text });

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ type: "", text: "" });
      messageTimeoutRef.current = null;
    }, 5000);
  };

  return (
    <Router>
      <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
        {/* Fixed Header */}
        <header className="fixed w-full h-16 bg-gray-900 flex items-center justify-between px-4 sm:px-8 z-50">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <a
              href="https://www.vttresearch.com/fi"
              target="_blank"
              /* Security best practice */
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <img
                src="/src/assets/vtt_logo.png"
                alt="VTT Logo"
                className="h-10 w-auto object-contain"
              />
            </a>
          </div>

          {/* Help Icon */}
          <div
            className="relative"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <div
              role="button"
              aria-label="Help"
              tabIndex={0}
              className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-lg cursor-pointer outline-none text-xl font-bold"
            >
              ?
            </div>

            {/* Floating Modal */}
            {hovering && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-modal-title"
                className="absolute right-0 mt-3 w-[90vw] max-w-screen-lg bg-gray-800 text-white p-6 rounded-xl shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto z-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 id="help-modal-title" className="text-2xl font-semibold">
                    About Future Customer: A Simulator and Prediction Tool
                  </h2>
                  <button
                    onClick={() => setHovering(false)}
                    aria-label="Close Help"
                    className="text-white text-xl font-bold hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm leading-relaxed">
                  This is a software development project for VTT by a team of
                  students at Helsinki University. The program can be used to
                  help predict consumer behaviour by creating agents based on
                  historical data and simulating their answers with LLMs. Users
                  can query agents and receive Likert scale chart responses, or
                  export results as CSV.
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route
              path="/future"
              element={
                <FuturePage
                  handleCsvSubmit={handleCsvSubmit}
                  isLoading={isLoading}
                  response={distribution}
                  futureResponse={futureDistribution}
                  showMessage={showMessage}
                  setCsvUploaded={setCsvUploaded}
                  submittedScenario={submittedScenario}
                  setSubmittedScenario={setSubmittedScenario}
                  resetResponse={() => {
                    setDistribution([]);
                    setFutureDistribution([]);
                  }}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
