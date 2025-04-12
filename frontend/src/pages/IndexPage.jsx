import React, { useState, useEffect } from "react";

const IndexPage = () => {
  const [agents, setAgents] = useState([]);
  const [agentCount, setAgentCount] = useState("");
  // const [agentsCreated, setAgentsCreated] = useState(false); TODO!

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const count = parseInt(agentCount, 10);
  const isValid = !isNaN(count) && count >= 1 && count <= 100; // Dynamically changes depending on input value

  const handleSubmit = async () => {
    if (!isValid) {
      setError("⚠️ Please enter a valid number.");
      return;
    }

    setError("");
    setLoading(true);
    setAgentCount(""); // Clear input field

    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";

      const response = await fetch(`${BACKEND_URL}/?agents=${count}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const agentsData = await response.json();
      console.log("Agents created!", agentsData);
      setAgents(agentsData); // Optional if you want to store or show
      setSuccessMessage(`${agentsData.length} agents created successfully! ✅`);
    } catch (error) {
      console.error("[DEBUG] Error creating agents:", error);
      setError("⚠️ Could not create agents from initial backend CSV-file");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  // Clear message after 5-2 = 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col px-4">
      {/* Fixed top title */}
      <header className="w-full text-center pt-22 px-4">
        <h1 className="text-4xl font-bold">
          Future Customer: A Simulator and Prediction Tool
        </h1>

        <p className="text-lg mt-20 max-w-2xl mx-auto text-center leading-relaxed">
          Welcome to our application!
          <br />
          <br />
          This application enables you to simulate and predict customer
          behavior.
          <br />
          For additional information, hover over the <strong>?</strong> icon in
          the top-right corner.
        </p>

        <p className="text-lg mt-12 max-w-2xl mx-auto text-center leading-relaxed">
          Begin by selecting the number of agents you want to create.
        </p>

        {/* Error + Input Block */}
        <div className="relative mt-12 flex flex-col items-center space-y-4">
          {/* Error Message & Loading Indicator */}
          {(error || loading || successMessage) && (
            <div className="absolute bottom-25 flex items-center space-x-2 text-sm">
              {loading ? (
                <>
                  <span className="text-blue-400">
                    Loading agents
                    <span className="animate-pulse">...</span>
                  </span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : error ? (
                <span className="text-red-400">{error}</span>
              ) : (
                <span className="text-green-600">{successMessage}</span>
              )}
            </div>
          )}
          {/* Error Message & Loading Indicator End */}

          {/* Agent Count Input Field */}
          <input
            type="number"
            min={1}
            max={100}
            disabled={loading}
            value={agentCount}
            onChange={(e) => setAgentCount(e.target.value)}
            className="w-64 px-4 py-2 text-white bg-transparent border border-white rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
            placeholder="Enter a number (1–100)"
          />
          {/* Agent Count Input Field End */}

          {/* Agent Count Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`${
              isValid && !loading
                ? "bg-blue-600 hover:bg-blue-700  hover:scale-105 active:scale-95 transition-transform duration-800 ease-in-out cursor-pointer"
                : "bg-gray-700 scale-95 transition-transform duration-800 ease-in-out cursor-not-allowed"
            } text-white font-semibold py-2 px-6 rounded-xl shadow-md flex items-center space-x-2`}
          >
            <span>Submit</span>
            <span className="text-lg" aria-hidden="true">
              {isValid && !loading ? "🔓" : "🔒"}
            </span>
          </button>
          {/* Agent Count Submit Button end */}
        </div>
      </header>
    </div>
  );
};

export default IndexPage;
