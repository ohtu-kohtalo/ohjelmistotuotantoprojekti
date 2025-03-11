import React from "react";
import Title from "../components/Title";
import PlotContainer from "../components/PlotContainer";

const InitialDistribution = ({ data }) => (
  <div id="initialDistribution" className="card active">
    <h3 className="card-header">Agent Pool Distribution Graphs</h3>
    <div className="graph-placeholder">
      <PlotContainer agentData={data} />
    </div>
  </div>
);

export default InitialDistribution;
