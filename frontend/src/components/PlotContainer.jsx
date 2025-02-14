import React from "react";
import { useState } from "react";
import pieChartIcon from "../assets/pie-chart.png";
import barChartIcon from "../assets/bar-chart.png";
import OptionContainer from "./OptionContainer";

const PlotContainer = () => {
  const [chartType, setChartType] = useState("placeholder");

  const chartImages = {
    pie: "https://dummyimage.com/400x300/cccccc/000000&text=Pie+Chart",
    bar: "https://dummyimage.com/400x300/cccccc/000000&text=Bar+Chart",
    graph: "https://dummyimage.com/400x300/cccccc/000000&text=Graph+Chart",
    placeholder:
      "https://dummyimage.com/400x300/cccccc/000000&text=Chart+Placeholder",
  };

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

        <div className="plot-area">
          <img
            src={chartImages[chartType]}
            alt="Placeholder Graph"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </div>

      <OptionContainer />
    </div>
  );
};

export default PlotContainer;
