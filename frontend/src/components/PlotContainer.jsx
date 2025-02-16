import React from "react";
import { useState } from "react";
import pieChartIcon from "../assets/pie-chart.png";
import barChartIcon from "../assets/bar-chart.png";
import OptionContainer from "./OptionContainer";
import ScatterPlot from "./ScatterPlot";

const PlotContainer = () => {
  const [chartType, setChartType] = useState("placeholder");
  const [selectedX, setSelectedX] = useState("age"); // default x axis

  const chartImages = {
    pie: "https://dummyimage.com/400x300/cccccc/000000&text=Pie+Chart",
    bar: "https://dummyimage.com/400x300/cccccc/000000&text=Bar+Chart",
    graph: "https://dummyimage.com/400x300/cccccc/000000&text=Graph+Chart",
    placeholder:
      "https://dummyimage.com/400x300/cccccc/000000&text=Chart+Placeholder",
  };
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
          <h3 className="plot-title">Data Information | Graph Selection |</h3>
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

        <OptionContainer
          firstOption="age"
          secondOption="income"
          thirdOption="gender"
          onSelect={setSelectedX}
        />
        <div className="plot-area">
          {chartType == "graph" ? (
            <ScatterPlot data={sampleData} xAxis={selectedX}/>
          ) : (
            <p>Select a graph type to display</p>
          )}
{/*           <img
            src={chartImages[chartType]}
            alt="Placeholder Graph"
            style={{ maxWidth: "100%", height: "auto" }}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default PlotContainer;
