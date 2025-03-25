import React, { useEffect, useState } from "react";
import StackedBarChart from "./StackedBarChart";

const PlotContainer = ({ agentData = [] }) => {
  const [chartType, setChartType] = useState("bar"); // Default to bar chart
  const [selectedX, setSelectedX] = useState("age");

  // Ensure age is treated as number for calculations
  const cleanAgentData = agentData.map((agent) => ({
    ...agent,
    age: typeof agent.age === "string" ? parseInt(agent.age, 10) : agent.age,
  }));

  const calculateAverage = (data, key) => {
    const validValues = data
      .map((d) => d[key])
      .filter((value) => typeof value === "number" && !isNaN(value));

    return validValues.length
      ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1)
      : "N/A";
  };

  const getGenderDistribution = (data) => {
    const genderCounts = data.reduce((acc, item) => {
      const gender = item.gender?.toString().trim().toLowerCase();
      if (!gender) return acc;
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(genderCounts)
      .map(([key, value]) => `${key[0].toUpperCase() + key.slice(1)}: ${value}`)
      .join(", ");
  };

  return (
    <div id="initialDistribution" className="card active">
      <h3 className="card-header">Initial demographic distributions</h3>

      <div className="plot-area">
        <div className="variable-buttons">
          <button
            className={`variable-button ${selectedX === "age" ? "active" : ""}`}
            onClick={() => setSelectedX("age")}
          >
            Age
          </button>
          <button
            className={`variable-button ${selectedX === "gender" ? "active" : ""}`}
            onClick={() => setSelectedX("gender")}
          >
            Gender
          </button>
        </div>

        <div className="chart-container">
          {chartType === "bar" ? (
            <StackedBarChart data={cleanAgentData} xAxis={selectedX} />
          ) : (
            <p>[Graph placeholder]</p>
          )}
        </div>

        <div className="summary-container">
          <h4>Data Summary</h4>
          <p>
            <strong>Total Entries:</strong> {cleanAgentData.length}
          </p>
          <p>
            <strong>Average Age:</strong>{" "}
            {calculateAverage(cleanAgentData, "age")}
          </p>
          <p>
            <strong>Gender Distribution:</strong>{" "}
            {getGenderDistribution(cleanAgentData)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlotContainer;
