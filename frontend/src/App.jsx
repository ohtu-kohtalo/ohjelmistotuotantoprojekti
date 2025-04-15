// import React, { useRef, useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route, Link } from "react-router";
// import "./index.css";
// import ErrorMessage from "./components/ErrorMessage";
// import SuccessMessage from "./components/SuccessMessage";
// import HelpPage from "./pages/HelpPage";
// import InitialDistribution from "./pages/InitialDistribution";
// import AddQuery from "./pages/AddQuery";
// import CsvDownload from "./components/CsvDownload";

// const App = () => {
//   // Initial state for distributions + scenario
//   const [distribution, setDistribution] = useState([]);
//   const [futureDistribution, setFutureDistribution] = useState([]);
//   const [submittedScenario, setSubmittedScenario] = useState("");

//   // Initial states for response and error handling
//   const [message, setMessage] = useState({ type: "", text: "" });
//   const [isLoading, setIsLoading] = useState(false);
//   const messageTimeoutRef = useRef(null);

//   // Initial state for agents
//   const [agents, setAgentCreation] = useState([]);

//   // State for checking whether csv has been uploaded
//   const [csvUploaded, setCsvUploaded] = useState(false);

//   useEffect(() => {
//     /**
//      * Asynchronously creates agents by fetching data from the backend.
//      *
//      * This function attempts to initiate a create-agent route on the backend side.
//      * Upon successful fetch, it logs the status message and displays success message to user.
//      *
//      * @async
//      * @function createAgents
//      * @returns {Promise<void>} A promise that resolves when the agents are created.
//      * @throws Will throw an error if the fetch request fails.
//      */
//     const createAgents = async () => {
//       try {
//         const BACKEND_URL =
//           import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
//         const response = await fetch(`${BACKEND_URL}/`);
//         if (!response.ok) throw new Error(`Error: ${response.status}`);

//         const agentsData = await response.json(); // ✅ Expect actual agent data now
//         console.log("Agents created!", agentsData);

//         setAgentCreation(agentsData); // ✅ Set agent data into state
//         showMessage(
//           "success",
//           "Agents successfully created from backend CSV! ✅",
//         );
//       } catch (error) {
//         console.error("Error creating agents:", error);
//         showMessage(
//           "error",
//           "⚠️ Could not create agents from initial backend CSV-file",
//         );
//       }
//     };

//     createAgents();
//   }, []);

//   /**
//    * Handles the submission of a CSV file containing questions to the backend.
//    *
//    * This function sends the provided questions to the backend as a JSON payload,
//    * waits for the response, and updates the state accordingly.
//    *
//    * @param {Array} csvQuestions - An array of questions extracted from the CSV file.
//    * @returns {Promise<void>} - A promise that resolves once the submission is processed.
//    */
//   const handleCsvSubmit = async (csvQuestions) => {
//     setIsLoading(true);
//     try {
//       const BACKEND_URL =
//         import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";
//       const response = await fetch(`${BACKEND_URL}/receive_user_csv`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           questions: csvQuestions,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status} - ${response.statusText}`);
//       }

//       showMessage("success", "CSV submitted successfully! 📂👍");
//       const data = await response.json();

//       console.log("[DEBUG] Reached here #1");

//       setDistribution(data.distributions);
//       setFutureDistribution(data.future_distributions);

//       if (data.future_distributions.length > 0) {
//         console.log("[DEBUG] Reached here #2, with futureDistribution!");
//       }

//       setCsvUploaded(true);
//     } catch (error) {
//       console.error("CSV submission error:", error);
//       showMessage("error", "⚠️ Could not submit CSV data");
//       setCsvUploaded(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Helper function to display error messages
//   const showMessage = (type, text) => {
//     setMessage({ type, text });

//     // Clear any existing timeout before setting a new one
//     if (messageTimeoutRef.current) {
//       clearTimeout(messageTimeoutRef.current);
//     }

//     messageTimeoutRef.current = setTimeout(() => {
//       setMessage({ type: "", text: "" });
//       messageTimeoutRef.current = null; // Reset ref after clearing error
//     }, 5000);
//   };

//   return (
//     <BrowserRouter>
//       {/* Render messages above the app-container so they aren’t affected by its hover effect */}
//       {message && (
//         <>
//           {message.type === "error" && <ErrorMessage message={message.text} />}
//           {message.type === "success" && (
//             <SuccessMessage message={message.text} />
//           )}
//         </>
//       )}
//       <div className="app-container">
//         <div className="sidebar">
//           <Link to="/" className="sidebar-link">
//             Help Page
//           </Link>
//           <Link to="/initialDistribution" className="sidebar-link">
//             Initial Distribution
//           </Link>
//           <Link to="/addQuery" className="sidebar-link">
//             Add Query
//           </Link>
//           <div className="sidebar-csv-download">
//             <CsvDownload fileName="agent_answers.zip" disabled={!csvUploaded} />
//           </div>
//         </div>
//         <div className="content">
//           <Routes>
//             <Route path="/" element={<HelpPage />} />
//             <Route
//               path="/initialDistribution"
//               element={<InitialDistribution data={agents} />}
//             />
//             <Route
//               path="/addQuery"
//               element={
//                 <AddQuery
//                   handleCsvSubmit={handleCsvSubmit}
//                   isLoading={isLoading}
//                   response={distribution}
//                   futureResponse={futureDistribution}
//                   showMessage={showMessage}
//                   resetResponse={() => {
//                     setDistribution([]);
//                     setFutureDistribution([]);
//                   }}
//                   setCsvUploaded={setCsvUploaded}
//                   submittedScenario={submittedScenario}
//                   setSubmittedScenario={setSubmittedScenario}
//                 />
//               }
//             />
//           </Routes>
//         </div>
//       </div>
//     </BrowserRouter>
//   );
// };

// export default App;

// The code below is transition to TailwindCSS

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import IndexPage from "./pages/IndexPage";
import PresentPage from "./pages/PresentPage";
import FuturePage from "./pages/FuturePage";
import "./index.css";

const App = () => {
  const [hovering, setHovering] = useState(false);

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
              // This is a security measure
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
          {/* Logo End */}

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
            {/* Help Icon End*/}

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
            {/* Floating Modal End*/}
          </div>
        </header>
        {/* Header End */}

        {/* Main Content */}
        <div>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/present" element={<PresentPage />} />
            <Route path="/future" element={<FuturePage />} />
          </Routes>
        </div>
      </div>
      {/* Main Content End */}
    </Router>
  );
};

export default App;
