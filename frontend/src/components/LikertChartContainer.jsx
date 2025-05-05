/**
 * @file LikertChartContainer.jsx
 *
 * The component:
 * Cycles through a set of Likert-scale questions and renders each one as an animated `<LikertBar>` (current-vs-future, if provided).
 * Displays basic descriptive statistics (median, mode, variation ratio) using Statistics-component.
 * Provides ⇦ / ⇨ buttons to move between questions, with wrap-around logic.
 *
 * Data:
 * ------
 * Empty-state
 * -----------
 * When `chartsData` is missing or empty, the component shows a grey instructional panel describing the expected CSV format.
 * When chartsData is provided, it displays the data using the `<LikertBar>` component.
 *
 * Props
 * -----
 * @prop {Array<{
 *   question:   string,
 *   data:       Array<{ label: string, value: number }>,
 *   statistics: { median: string|number, mode: string|number, "variation ratio": number }
 * }>} chartsData
 *
 * @prop {Array<{
 *   data: Array<{ label: string, value: number }>
 * }>} [futureData=[]]
 *     Optional future-scenario data aligned by index with `chartsData`.
 *
 * @module LikertChartContainer
 */

import React, { useState } from "react";
import LikertBar from "./LikertBar";
import Statistics from "./StatisticsContainer";

/**
 * Holds one Likert chart at a time with nav + stats.
 *
 * @param {Object}   props
 * @param {Array}    props.chartsData   – Present-day Likert datasets.
 * @param {Array}    [props.futureData] – Future Likert datasets (optional).
 *
 * @returns {JSX.Element}
 */
const LikertChartContainer = ({ chartsData, futureData = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks which chart/question is currently displayed

  // If no data is provided, show a placeholder message
  if (!chartsData || chartsData.length === 0) {
    return (
      <div className="w-full min-h-[80vh] p-4 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-lg">
        <p className="text-center text-gray-400 text-lg mt-8">
          Choose and upload a CSV-file with questions on it to see Likert Scale
          charts. If you provided a CSV-file before applying your future
          scenario, re-enter the same CSV-file again to see the charts for the
          agents transferred to the future.
          <br />
          Correct format for the CSV-file is one question per row in the first
          column.
        </p>
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
      (prevIndex) => (prevIndex - 1 + chartsData.length) % chartsData.length,
    );
  };

  return (
    <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 h-full min-h-[500px]">
      {/* Renders the Likert bar chart for current data and optional future data */}
      <div className="w-full mb-6 overflow-x-auto">
        <LikertBar
          data={chartsData[currentIndex].data}
          futureData={futureData[currentIndex]?.data || []}
          question={chartsData[currentIndex].question}
        />
      </div>

      {/* Navigation buttons for cycling through charts */}
      <div className="flex justify-center space-x-4 mt-8">
        <button onClick={handlePrev} className="text-white text-2xl">
          ⬅
        </button>
        <button onClick={handleNext} className="text-white text-2xl">
          ➡
        </button>
      </div>

      {/* Info text showing the current chart number out of total */}
      <p className="text-center text-gray-300 mt-4">
        Chart {currentIndex + 1} / {chartsData.length}
      </p>

      {/* Renders statistics like median, mode, and variation ratio */}
      <div className="flex justify-center items-center mt-4">
        <div className="p-4 rounded-lg">
          <Statistics
            median={stats.median}
            mode={stats.mode}
            variationRatio={stats["variation ratio"]}
          />
        </div>
      </div>
    </div>
  );
};

export default LikertChartContainer;
