import React from "react";
import Title from "../components/Title";
import PlotContainer from "../components/PlotContainer";

const InitialDistribution = ({ distributions }) => (
  <div className="card">
    <div className="graph-placeholder">
      <PlotContainer agentData={distributions} />
    </div>
  </div>
);

export default InitialDistribution;
