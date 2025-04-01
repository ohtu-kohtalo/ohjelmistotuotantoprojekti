import React, { useState } from "react";
import LikertBar from "./LikertBar";
import Statistics from "./StatisticsContainer";

/**
 * LikertChartContainer is responsible for rendering a visual representation
 * of Likert-scale responses using horizontal bar charts. It also shows
 * statistical summaries and allows navigation between multiple questions.
 *
 * Props:
 * - chartsData: Array of objects representing each question's current agent data.
 * - futureData: Array of objects representing future scenario data for each question.
 */
const LikertChartContainer = ({
  chartsData,
  futureData,
  submittedScenario,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks which chart/question is currently displayed

  // If no data is provided, show a placeholder message
  if (!chartsData || chartsData.length === 0) {
    return (
      <div className="likert-chart-container-plot-area">
        <p className="no-data-placeholder">[Graph placeholder]</p>
      </div>
    );
  }

  const stats = chartsData[currentIndex].statistics; // Get stats for the current question

  // Move to the next chart/question, wrapping around if at the end
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % chartsData.length);
  };

  // Move to the previous chart/question, wrapping around if at the beginning
  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + chartsData.length) % chartsData.length
    );
  };

  return (
    <div className="likert-chart-container-plot-area">
      {/* Renders the Likert bar chart for current data and optional future data */}
      <LikertBar
        data={chartsData[currentIndex].data}
        futureData={futureData[currentIndex]?.data}
        question={chartsData[currentIndex].question}
      />

      {submittedScenario.length > 0 && (
        <div className="future-scenario-text-container">
          <p className="future-scenario-text">
            Future scenario: {submittedScenario}
          </p>
        </div>
      )}
      {/* Renders statistics like median, mode, and variation ratio */}
      <div className="Statistics">
        <Statistics
          median={stats.median}
          mode={stats.mode}
          variationRatio={stats["variation ratio"]}
        />
      </div>

      {/* Navigation buttons for cycling through charts */}
      <div className="likert-button-container">
        <button onClick={handlePrev} className="likert-button">
          ⬅
        </button>
        <button onClick={handleNext} className="likert-button">
          ➡
        </button>
      </div>

      {/* Info text showing the current chart number out of total */}
      <p className="likert-chart-info">
        Chart {currentIndex + 1} / {chartsData.length}
      </p>
    </div>
  );
};

export default LikertChartContainer;
