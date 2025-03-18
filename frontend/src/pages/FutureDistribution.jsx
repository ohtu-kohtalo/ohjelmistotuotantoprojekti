import React from "react";
import CsvDownload from "../components/CsvDownload";

const FutureDistribution = () => {
  return (
    <div id="FutureDistribution" className="card active">
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
