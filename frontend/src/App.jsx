/**
 * @file App.jsx
 *
 * Root component that wires together routing and shared state for the Future Customer tool.
 *
 * ROUTING & ANIMATION
 * -------------------
 * Uses **react-router v6** inside `<BrowserRouter>`.
 * Two paths are defined:
 *   “/”         ⟶ `<IndexPage>`   – agent creation screen
 *   “/future”   ⟶ `<FuturePage>`  – scenario builder / dashboard
 *
 * Every page element is wrapped with `<PageTransition>` and rendered through
 * `framer-motion`’s `<AnimatePresence>` for smooth cross-fade navigation.
 *
 * STATES
 * ------------
 * `distribution` / `futureDistribution` (arrays) hold present-day and scenario Likert data that comes from backend.
 * `submittedScenario` (string) — last scenario the user posted if provided, backend comes back with simulated future data.
 * `csvUploaded` (bool) — toggles UI elements that require CSV input first.
 * `isLoading` (bool) — spinner flag set while network calls run.
 * `message` ({type,text}) — handles correct visualisation of messaging to user, cleared after 3 s.
 *
 * SIDE EFFECTS
 * ------------
 * `handleCsvSubmit()`  POSTs `{questions:[…]}` to
 *   `${VITE_BACKEND_URL || "http://127.0.0.1:5500"}/receive_user_csv` and populates the distribution arrays on success.
 * `showMessage()` handles messaging to the user
 */

import React, { useState, useRef } from "react";
/* NOTE: BrowserRouter, Routes, Route, and useLocation all come from
   react-router-dom in v6. */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import IndexPage from "./pages/IndexPage";
import FuturePage from "./pages/FuturePage";
import PageTransition from "./components/PageTransition";
import "./index.css";

/**
 * Helper function for page-transition animations
 * Moved outside of App to avoid unnecessary re-renders.
 */
const AnimatedRoutes = ({
  handleCsvSubmit,
  isLoading,
  distribution,
  futureDistribution,
  showMessage,
  setCsvUploaded,
  submittedScenario,
  setSubmittedScenario,
  resetResponse,
  message,
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <IndexPage />
            </PageTransition>
          }
        />
        <Route
          path="/future"
          element={
            <PageTransition>
              <FuturePage
                handleCsvSubmit={handleCsvSubmit}
                isLoading={isLoading}
                response={distribution}
                futureResponse={futureDistribution}
                showMessage={showMessage}
                setCsvUploaded={setCsvUploaded}
                submittedScenario={submittedScenario}
                setSubmittedScenario={setSubmittedScenario}
                resetResponse={resetResponse}
                message={message}
              />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

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

      showMessage("success", "CSV submitted successfully! 📂👍");
      const data = await response.json();

      setDistribution(data.distributions);
      setFutureDistribution(data.future_distributions);
      setCsvUploaded(true);
    } catch (error) {
      showMessage("error", "⚠️ Could not submit CSV data");
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
    }, 3000);
  };

  return (
    <Router>
      <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
        {/* Fixed Header */}
        <header className="fixed w-full h-16 bg-gray-900 flex items-center justify-between px-4 sm:px-8 z-50">
          {/* Logo Mock */}
          <div className="flex items-center space-x-2">
            <a
              href="https://www.vttresearch.com/fi"
              target="_blank"
              /* Security best practice */
              rel="noopener noreferrer"
              className="relative flex items-center space-x-2 group"
            >
              {/* text-based logo instead of image for copyright purposes */}
              <h2
                className="text-3xl font-extrabold tracking-wider
                 transform transition-transform duration-1000
                 group-hover:scale-105"
              >
                VTT
              </h2>

              {/* Hover tooltip */}
              <span
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1
                 px-2 py-1 text-xs text-white bg-gray-800 rounded
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                 pointer-events-none whitespace-nowrap"
              >
                Visit VTT webpage
              </span>
            </a>
          </div>

          {/* Help Icon + Floating Modal*/}
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

            {/* Floating Modal About Application*/}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-modal-title"
              className={`absolute right-0 mt-3 w-[90vw] max-w-screen-lg bg-gray-800 text-white p-6 rounded-xl shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto z-50 transform transition-all duration-800 ease-in-out ${
                hovering
                  ? "opacity-100 pointer-events-auto translate-y-0"
                  : "opacity-0 pointer-events-none -translate-y-4"
              }`}
            >
              {/* Modal Content */}
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
              <div className="text-sm leading-relaxed">
                This application, developed by a team of University of Helsinki
                students for VTT, simulates consumer behavior by creating AI
                agents from questionnaire data.
                <br />
                <br />
                <strong>Agents can:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>
                    Answer statements beyond the original survey using large
                    language models (LLMs).
                  </li>
                  <li>Provide responses on a Likert scale (1–5).</li>
                  <li>
                    Be transformed under hypothetical future scenarios to
                    predict behavioral shifts.
                  </li>
                </ul>
                <strong>Tool features:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Visualize agent responses through interactive graphs.</li>
                  <li>
                    Export both current and future agent responses as CSV files
                    for deeper analysis.
                  </li>
                </ul>
                <br />
                Use this tool to explore and compare consumer insights under
                various scenarios.
              </div>
              {/* Modal Content End*/}
            </div>
            {/* Floating Modal About Application End*/}
          </div>
          {/* Help Icon + Modal End*/}
        </header>

        {/* Main Content */}
        <div className="pt-16">
          {/* Render animated routes */}
          <AnimatedRoutes
            handleCsvSubmit={handleCsvSubmit}
            isLoading={isLoading}
            distribution={distribution}
            futureDistribution={futureDistribution}
            showMessage={showMessage}
            setCsvUploaded={setCsvUploaded}
            submittedScenario={submittedScenario}
            setSubmittedScenario={setSubmittedScenario}
            resetResponse={() => {
              setDistribution([]);
              setFutureDistribution([]);
            }}
            message={message}
          />
        </div>
      </div>
    </Router>
  );
};

export default App;
