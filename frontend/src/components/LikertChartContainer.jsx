import React, { useState } from "react";
import LikertBar from "./LikertBar";
import Statistics from "./StatisticsContainer";

const LikertChartContainer = ({ chartsData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!chartsData || chartsData.length === 0) {
    return (
      <div className="likert-chart-container-plot-area">
        <p className="no-data-placeholder">[Graph placeholder]</p>
      </div>
    );
  }

  const stats = chartsData[currentIndex].statistics;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % chartsData.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + chartsData.length) % chartsData.length,
    );
  };

  return (
    <div className="likert-chart-container-plot-area">
      <LikertBar
        data={chartsData[currentIndex].data}
        question={chartsData[currentIndex].question}
      />
      <div className="Statistics">
        <Statistics
          median={stats.median}
          mode={stats.mode}
          variationRatio={stats["variation ratio"]}
          />
      </div>
      <div className="likert-button-container">
        <button onClick={handlePrev} className="likert-button">
          ⬅
        </button>
        <button onClick={handleNext} className="likert-button">
          ➡
        </button>
      </div>
      <p className="likert-chart-info">
        Chart {currentIndex + 1} / {chartsData.length}
      </p>
    </div>
  );
};

export default LikertChartContainer;
