import React, { useState, useEffect } from "react";

const IndexPage = () => {
  const [agentCount, setAgentCount] = useState("");
  const [error, setError] = useState("");

  const count = parseInt(agentCount, 10);
  const isValid = !isNaN(count) && count >= 1 && count <= 100;

  const handleSubmit = () => {
    const count = parseInt(agentCount, 10);
    if (isNaN(count) || count < 1 || count > 100) {
      setError("Please enter a valid number!");
    } else {
      setError("");
      // Proceed with the agent creation logic here
      console.log(`Creating ${count} agents...`);
    }
  };

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

        <p className="text-lg mt-24 max-w-2xl mx-auto text-center leading-relaxed">
          Begin by selecting the number of agents you want to create.
        </p>

        {/* Error + Input Block */}
        <div className="relative mt-12 flex flex-col items-center space-y-4">
          {/* Error Message */}
          {error && (
            <p className="absolute bottom-25 text-red-400 text-sm">{error}</p>
          )}

          {/* Input Field */}
          <input
            type="number"
            min={1}
            max={100}
            value={agentCount}
            onChange={(e) => setAgentCount(e.target.value)}
            className="w-64 px-4 py-2 text-white bg-transparent border border-white rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
            placeholder="Enter a number (1–100)"
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`${
              isValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 cursor-not-allowed"
            } text-white font-semibold py-2 px-6 rounded-xl shadow-md flex items-center space-x-2 transition-all duration-800 ease-in-out`}
          >
            <span>Submit</span>
            <span className="text-lg" aria-hidden="true">
              {isValid ? "🔓" : "🔒"}
            </span>
          </button>
        </div>
      </header>
    </div>
  );
};

export default IndexPage;
