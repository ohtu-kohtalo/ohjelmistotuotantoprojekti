import React, { useState } from "react";
import pieChartIcon from "../assets/pie-chart.png";
import barChartIcon from "../assets/bar-chart.png";
import clusterIcon from "../assets/clustering.png";
import ScatterPlot from "./ScatterPlot";
import StackedBarChart from "./StackedBarChart";
import PieChart from "./PieChart";

const sampleData = [
  { name: "Agent A", age: 25, gender: "Male", income: 30000, response: 1 },
  { name: "Agent B", age: 40, gender: "Female", income: 60000, response: 3 },
  { name: "Agent C", age: 32, gender: "Male", income: 45000, response: 4 },
  { name: "Agent D", age: 29, gender: "Female", income: 35000, response: 5 },
  { name: "Agent E", age: 22, gender: "Male", income: 28000, response: 2 },
  { name: "Agent F", age: 45, gender: "Female", income: 52000, response: 4 },
  { name: "Agent G", age: 28, gender: "Male", income: 39000, response: 3 },
  { name: "Agent H", age: 45, gender: "Female", income: 70000, response: 5 },
  { name: "Agent I", age: 31, gender: "Male", income: 48000, response: 2 },
  { name: "Agent J", age: 27, gender: "Female", income: 34000, response: 1 },
  { name: "Agent K", age: 38, gender: "Male", income: 56000, response: 4 },
  { name: "Agent L", age: 66, gender: "Female", income: 31000, response: 3 },
  { name: "Agent M", age: 50, gender: "Male", income: 42000, response: 5 },
  { name: "Agent N", age: 55, gender: "Male", income: 150000, response: 5 },
];

const PlotContainer = ({ agentData = sampleData }) => {
  const [chartType, setChartType] = useState("placeholder");
  const [selectedX, setSelectedX] = useState("age"); // Default x-axis
  const [isClustered, setIsClustered] = useState(false);

  return (
    <div id="initialDistribution" className="card active">
      <div className="card-common-header">
        <button
          className="circle-button"
          onClick={() => setChartType("pie") & setIsClustered(false)}
        >
          <img className="button-image" src={pieChartIcon} alt="Pie Chart" />
        </button>
        <button
          className="circle-button"
          onClick={() => setChartType("bar") & setIsClustered(false)}
        >
          <img className="button-image" src={barChartIcon} alt="Bar Chart" />
        </button>
        <button className="circle-button" onClick={() => setIsClustered(true)}>
          <img className="button-image" src={clusterIcon} alt="Cluster Chart" />
        </button>
      </div>
      <h3 className="card-header">Initial Answer Graphs</h3>
      <div className="graph-placeholder">
        <div className="variable-buttons">
          <button
            className="variable-button"
            onClick={() => setSelectedX("age")}
          >
            Age
          </button>
          <button
            className="variable-button"
            onClick={() => setSelectedX("income")}
          >
            Income
          </button>
          <button
            className="variable-button"
            onClick={() => setSelectedX("gender")}
          >
            Gender
          </button>
        </div>
        <div className="plot-area">
          {isClustered ? (
            <ScatterPlot
              data={agentData}
              xAxis={selectedX}
              clusterBy="response"
            />
          ) : chartType === "pie" ? (
            <PieChart data={agentData} category={selectedX} />
          ) : chartType === "bar" ? (
            <StackedBarChart data={agentData} xAxis={selectedX} />
          ) : (
            <p>[Select graph type to display]</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlotContainer;
