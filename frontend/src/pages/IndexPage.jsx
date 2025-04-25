import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IndexPage = () => {
  const [agents, setAgents] = useState([]);
  const [agentCount, setAgentCount] = useState("");
  const [agentsCreated, setAgentsCreated] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showButtonHelp, setShowButtonHelp] = useState(false);

  const count = parseInt(agentCount, 10);
  const isValid = !isNaN(count) && count >= 1 && count <= 100;

  const navigate = useNavigate();

  // Reset function to clear all states
  const handleReset = () => {
    setAgents([]);
    setAgentCount("");
    setAgentsCreated(false);
    setShowButtonHelp(false);
    setError("");
    setSuccessMessage("");
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError("⚠️ Please enter a valid number.");
      return;
    }

    setError("");
    setLoading(true);
    // Reset input field
    setAgentCount("");

    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";

      const response = await fetch(`${BACKEND_URL}/?agents=${count}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const agentsData = await response.json();
      console.log("Agents created!", agentsData);
      setAgents(agentsData);
      setSuccessMessage(`${agentsData.length} agents created successfully! ✅`);
    } catch (error) {
      console.error("[DEBUG] Error creating agents:", error);
      setError("⚠️ Could not create agents from initial backend CSV-file");
    } finally {
      // Makes loading indicator spin for atleast 2 seconds
      // This is in order to prevent the loading indicator from disappearing too quickly
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");

        // Agents are considered "created" only after successMessage disappears
        // This is to prevent the top section from being dimmed before the success message disappears
        // And to provide a better user experience overall
        if (successMessage) {
          setAgentsCreated(true);
          setSuccessMessage("");
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  return (
    <div className="min-h-screen w-full text-white flex flex-col px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-screen-xl mx-auto">
        {/* 🔒 Top Section: dims & locks after agents are created */}
        <div
          className={`${agentsCreated ? "opacity-30 pointer-events-none" : ""} transition-opacity duration-300`}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-center">
            Future Customer: A Simulator and Prediction Tool
          </h1>

          <p className="text-base sm:text-lg lg:text-xl mt-10 sm:mt-16 max-w-2xl mx-auto text-center leading-relaxed">
            Welcome to our application!
            <br />
            <br />
            This application enables you to simulate and predict customer
            behavior.
            <br />
            For additional information, hover over the <strong>?</strong> icon
            in the top-right corner.
          </p>

          <p className="text-lg mt-12 max-w-2xl mx-auto text-center leading-relaxed">
            Begin by selecting the number of agents you want to create.
          </p>

          <div className="relative mt-10 sm:mt-12 sm:space-x-4 flex flex-col items-center  space-y-4">
            {(error || loading || successMessage) && (
              <div className="absolute -top-9 flex items-center space-x-2 text-sm">
                {loading ? (
                  <>
                    <span className="text-blue-400">
                      Loading agents<span className="animate-pulse">...</span>
                    </span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : error ? (
                  <span className="text-red-400">{error}</span>
                ) : (
                  <span className="text-green-400">{successMessage}</span>
                )}
              </div>
            )}

            <input
              type="number"
              min={1}
              max={100}
              disabled={loading}
              value={agentCount}
              onChange={(e) => setAgentCount(e.target.value)}
              className="
              w-64 text-lg font-semibold
              px-4 py-2 bg-transparent border border-white
              rounded-lg focus:border-blue-500 focus:outline-none
              transition-colors duration-200
              "
              placeholder="Enter a number (1–100)"
            />

            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`${
                isValid && !loading
                  ? "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-transform duration-800 ease-in-out cursor-pointer"
                  : "bg-gray-700 scale-95 transition-transform duration-800 ease-in-out cursor-not-allowed"
              } text-white font-semibold py-2 px-6 rounded-xl shadow-md flex items-center space-x-2`}
            >
              <span>Submit</span>
              <span className="text-lg" aria-hidden="true">
                {isValid && !loading ? "🔓" : "🔒"}
              </span>
            </button>
          </div>
        </div>

        {/* Divider Line */}
        <hr className="w-full border-t border-white/30 mt-12 sm:mt-16" />

        {/* Reset and Dashboard Buttons Section */}
        <div
          className={`mt-10 sm:mt-12 ${
            !agentsCreated ? "opacity-30 pointer-events-none" : "opacity-100"
          } transition-opacity duration-1000`}
        >
          {/* Reset Icon Button */}
          <div className="flex justify-center -mt-6 mb-4">
            <button
              onClick={handleReset}
              aria-label="Reset"
              className={`${
                agentsCreated
                  ? "bg-red-800 hover:bg-red-600 scale-100"
                  : "bg-gray-700 text-gray-400 scale-90"
              } hover:scale-105 cursor-pointer transition transform duration-1000 ease-in-out text-white py-1 px-2 rounded-full shadow-md`}
            >
              ⟲ Reset
            </button>
          </div>

          {/* Dashboard Button */}
          <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-4 items-center mt-8 px-4">
            <button
              onClick={() => navigate("/future", { state: { agents } })}
              className={`${
                agentsCreated
                  ? "bg-blue-500 hover:bg-blue-700 scale-100"
                  : "bg-gray-700 text-gray-400 scale-90"
              } hover:scale-105 cursor-pointer transition transform duration-1000 ease-in-out text-white font-semibold py-2 px-4 rounded-lg shadow-md`}
            >
              Dashboard 📈
            </button>
          </div>

          <div className="relative flex justify-center mt-2 z-40 w-full">
            {/* Bottom-Centered Help Icon with Floating Modal */}
            <div className="relative flex justify-center mt-6 z-40">
              {/* Hover Target is only the icon */}
              <div
                onMouseEnter={() => setShowButtonHelp(true)}
                onMouseLeave={() => setShowButtonHelp(false)}
                className="relative z-50"
              >
                {/* Icon Button */}
                <div
                  role="button"
                  aria-label="Explain Button Area"
                  tabIndex={0}
                  className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-lg cursor-pointer outline-none"
                >
                  <span className="text-xl font-bold text-white">?</span>
                </div>

                {/* Floating Modal */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="button-help-title"
                  className={`absolute bottom-[3.5rem] left-1/2 -translate-x-1/2 w-[95vw] sm:w-[90vw] max-w-screen-md bg-gray-800 text-white p-6 rounded-xl shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto transition-all duration-[600ms] ease-in-out transform ${
                    showButtonHelp
                      ? "opacity-100 pointer-events-auto translate-y-0"
                      : "opacity-0 pointer-events-none translate-y-4"
                  }`}
                >
                  <div className="space-y-4 text-sm leading-relaxed">
                    <h2
                      id="button-help-title"
                      className="text-xl sm:text-2xl font-semibold text-center mb-4"
                    >
                      What Do These Buttons Do?
                    </h2>
                    {/* Dashboard explanation */}
                    <div className="flex items-start">
                      <span className="w-28 shrink-0 font-semibold">
                        📈 Dashboard
                      </span>
                      <span className="text-left">
                        Go to the agent interaction screen where you can ask
                        questions, enter a future scenario, and export both
                        current and future responses as CSV.
                      </span>
                    </div>
                    {/* ⟲ Reset explanation */}
                    <div className="flex items-start">
                      <span className="w-28 shrink-0 font-semibold">
                        ⟲ Reset
                      </span>
                      <span className="text-left">
                        Clears current agents and unlocks the top section to
                        start over.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default IndexPage;
