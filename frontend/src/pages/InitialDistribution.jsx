import React from "react";
import PlotContainer from "../components/PlotContainer";

const InitialDistribution = ({ distributions }) => (
  <div className="card">
    <h3 className="card-header">Agent Pool Distribution Graphs</h3>
    <div className="graph-placeholder">
      <PlotContainer agentData={distributions} />
    </div>
  </div>
);

export default InitialDistribution;