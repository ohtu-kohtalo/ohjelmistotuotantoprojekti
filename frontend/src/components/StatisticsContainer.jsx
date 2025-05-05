import React from "react";

/**
 * Lightweight component for displaying statistical, numerical information regarding agents likert-scale answers.
 */

const Statistics = (props) => {
  return (
    <div>
      <b>Median:</b> {props.median}
      &nbsp;&nbsp;&nbsp;&nbsp;
      <b>Mode:</b> {props.mode}
      &nbsp;&nbsp;&nbsp;&nbsp;
      <b>Variation ratio:</b> {Math.round(props.variationRatio * 1000) / 1000}
    </div>
  );
};

export default Statistics;
