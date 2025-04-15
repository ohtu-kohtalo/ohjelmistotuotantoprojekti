import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import InitialDistribution from "../components/InitialDistribution";
import LikertChartContainer from "../components/LikertChartContainer";

const FuturePage = () => {
  const [showHelp, setShowHelp] = useState(false);
  // Using mockData for now!
  // const { agents } = location.state || {};

  // MOCK DATA:
  const mockAgents = [
    { age: 25, gender: "Male" },
    { age: 22, gender: "Female" },
    { age: 21, gender: "Male" },
    { age: 19, gender: "Female" },
    { age: 17, gender: "Male" },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white px-4 py-8 flex flex-col items-center space-y-12">
      {/* Title Placeholder */}
      <div className="text-lg font-semibold text-gray-400 mt-8">
        Future View
      </div>

      {/* Chart Section */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-center items-start gap-10 px-4">
        {/* Initial Distribution */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-4 text-gray-300 text-center">
            Demographic Distribution
          </h2>
          <InitialDistribution data={mockAgents} />
        </div>

        {/* Likert Chart */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-4 text-gray-300 text-center">
            Answers to Future Scenario
          </h2>
          <LikertChartContainer chartsData={[]} />
        </div>
      </div>
      {/* Chart Section End */}

      {/* Upload / Download Controls + ?-Icon */}
      <div className="flex flex-col items-center space-y-4 mt-8">
        <button className="w-40 bg-gray-800 cursor-pointer hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition text-center">
          Upload
        </button>
        <button className="w-40 bg-gray-800 cursor-pointer hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition text-center">
          Download
        </button>

        {/* Help Icon */}
        <div
          onMouseEnter={() => setShowHelp(true)}
          onMouseLeave={() => setShowHelp(false)}
          className="relative mt-4"
        >
          <button
            aria-label="Explain Future Page"
            className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-full shadow-md text-xl font-bold cursor-pointer"
          >
            ?
          </button>

          {showHelp && (
            <div className="absolute bottom-[3.5rem] left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-gray-800 text-white p-4 rounded-xl shadow-xl border border-gray-700 text-sm leading-relaxed z-50">
              <p>
                This page displays <strong>simulated future answers</strong>{" "}
                based on your selected scenario and current agent data.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Upload / Download Controls + ?-Icon End */}
    </div>
  );
};

export default FuturePage;
