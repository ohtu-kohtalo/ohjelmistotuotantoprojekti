import React from "react";
import pieChartIcon from "../assets/pie-chart.png";
import barChartIcon from "../assets/bar-chart.png";
import clusterIcon from "../assets/clustering.png";


const FutureDistribution = () => {
  return (
    <div id="FutureDistribution" className="card active">
      <div className="card-common-header">
        <button className="circle-button"> 
          <img className="button-image" src={pieChartIcon} alt="Pie Chart" />
        </button>
        <button className="circle-button"> 
          <img className="button-image" src={barChartIcon} alt="Bar Chart" />
        </button>
        <button className="circle-button"> 
          <img className="button-image" src={clusterIcon} alt="Cluster Chart" />
        </button>
      </div>
      <h3 className="card-header">Agent Pool Distribution Graphs</h3>
      <div className="graph-placeholder">
        <div className="variable-buttons">
          <button className="variable-button">
            Age
          </button>
          <button className="variable-button">
            Income
          </button>
          <button className="variable-button">
            Gender
          </button>
        </div>
        <div className="plot-area">
            <p>[Graph Placeholder]</p>
        </div>
      </div>
    </div>
  );
};

export default FutureDistribution;
