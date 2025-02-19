import React from "react";
import { useState } from "react";
import pieChartIcon from "../assets/pie-chart.png";
import barChartIcon from "../assets/bar-chart.png";
import OptionContainer from "./OptionContainer";
import DataContainer from "./DataContainer";
import ScatterPlot from "./ScatterPlot";

const PlotContainer = () => {
  const [chartType, setChartType] = useState("placeholder");
  const [selectedX, setSelectedX] = useState("age"); // default x axis

  const sampleData = [
    { name: "Agent A", age: 25, gender: "Male", income: 30000, response: 7 },
    { name: "Agent B", age: 40, gender: "Female", income: 60000, response: 5 },
    { name: "Agent C", age: 32, gender: "Male", income: 45000, response: 8 },
    { name: "Agent D", age: 29, gender: "Female", income: 35000, response: 6 },
  ];

  return (
    <div className="plot-container">
      <div className="plot-content">
        <div className="plot-header">
          <h3 className="plot-title">Data Visualization</h3>
          <div className="chart-buttons">
            <button onClick={() => setChartType("pie")}>
              <img src={pieChartIcon} alt="Pie Chart" className="chart-icon" />
            </button>
            <button onClick={() => setChartType("bar")}>
              <img src={barChartIcon} alt="Bar Chart" className="chart-icon" />
            </button>
            <button onClick={() => setChartType("graph")}>📈</button>
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
          {chartType == "graph" ? (
            <ScatterPlot data={sampleData} xAxis={selectedX} />
          ) : (
            <p>Select graph type to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlotContainer;
