import React from "react";
import barChartIcon from "../assets/bar-chart.png";

const FutureDistribution = () => {
  return (
    <div id="FutureDistribution" className="card active">
      <div className="card-common-header">
        <button className="circle-button">
          <img className="button-image" src={barChartIcon} alt="Bar Chart" />
        </button>
      </div>
      <h3 className="card-header">Future Answer Distribution Graphs || TODO</h3>
      <div className="graph-placeholder">
        <div className="variable-buttons">
          <button className="variable-button">Age</button>
          <button className="variable-button">Gender</button>
        </div>
        <div className="plot-area">
          <p>[Graph Placeholder]</p>
        </div>
      </div>
    </div>
  );
};

export default FutureDistribution;
