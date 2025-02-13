import React from "react";
import OptionContainer from "./OptionContainer";

const PlotContainer = () => (
  <div className="plot-container">
    <div className="plot-content">
      <h3 className="plot-title">Data Visualization</h3>

      <div className="plot-area">
        <img
          src="https://dummyimage.com/400x300/cccccc/000000&text=Chart+Placeholder"
          alt="Placeholder Graph"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    </div>
    <OptionContainer />
  </div>
);

export default PlotContainer;
