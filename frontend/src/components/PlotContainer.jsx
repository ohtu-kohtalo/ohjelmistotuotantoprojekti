import React from "react";
import { useState } from "react";
import pieChartIcon from "../assets/pie-chart.png";
import barChartIcon from "../assets/bar-chart.png";
import clusterIcon from "../assets/clustering.png";
import OptionContainer from "./OptionContainer";
import DataContainer from "./DataContainer";
import ScatterPlot from "./ScatterPlot";

const PlotContainer = ({ agentData }) => {
  const [chartType, setChartType] = useState("placeholder");
  const [selectedX, setSelectedX] = useState("age"); // default x axis
  const [isClustered, setIsClustered] = useState(false);

  // Sample data using liker-scale responses ranging from 1-5
  // Helper to generate graph data for display purposes
  const sampleData = [
    { name: "Agent A", age: 25, gender: "Male", income: 30000, response: 1 },
    { name: "Agent B", age: 40, gender: "Female", income: 60000, response: 3 },
    { name: "Agent C", age: 32, gender: "Male", income: 45000, response: 4 },
    { name: "Agent D", age: 29, gender: "Female", income: 35000, response: 5 },
    { name: "Agent E", age: 22, gender: "Male", income: 28000, response: 2 },
    { name: "Agent F", age: 35, gender: "Female", income: 52000, response: 4 },
    { name: "Agent G", age: 28, gender: "Male", income: 39000, response: 3 },
    { name: "Agent H", age: 45, gender: "Female", income: 70000, response: 5 },
    { name: "Agent I", age: 31, gender: "Male", income: 48000, response: 2 },
    { name: "Agent J", age: 27, gender: "Female", income: 34000, response: 1 },
    { name: "Agent K", age: 38, gender: "Male", income: 56000, response: 4 },
    { name: "Agent L", age: 26, gender: "Female", income: 31000, response: 3 },
    { name: "Agent M", age: 30, gender: "Male", income: 42000, response: 5 },
  ];

  // TODO: Placeholder for agent data handling in the future
  const processedAgentData = [];

  return (
    <div className="plot-container">
      <div className="plot-content">
        <div className="plot-header">
          <h3 className="plot-title">Agent Pool Visualization</h3>
          <div className="chart-buttons">
            <button onClick={() => setChartType("pie")}>
              <img src={pieChartIcon} alt="Pie Chart" className="chart-icon" />
            </button>
            <button onClick={() => setChartType("bar")}>
              <img src={barChartIcon} alt="Bar Chart" className="chart-icon" />
            </button>
            <button onClick={() => setIsClustered(!isClustered)}>
              <img
                src={clusterIcon}
                alt="Clustered Data"
                className="chart-icon"
              />
            </button>
          </div>
        </div>
        <div className="plot-details">
          <OptionContainer
            firstOption="age"
            secondOption="income"
            thirdOption="gender"
            onSelect={setSelectedX}
          />
          <DataContainer data={sampleData} />
        </div>
        <div className="plot-area">
          {isClustered ? (
            <ScatterPlot
              data={sampleData}
              xAxis={selectedX}
              clusterBy="response"
            />
          ) : chartType === "pie" ? (
            <p>Now displaying Pie Chart</p>
          ) : chartType === "bar" ? (
            <p>Now displaying Bar Chart</p>
          ) : (
            <p>Select graph type to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlotContainer;
