import React, { useState } from "react";
import LikertBar from "./LikertBar";

const LikertChartContainer = ({ chartsData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % chartsData.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + chartsData.length) % chartsData.length
    );
  };

  return (
    <div className="card p-4">
      <h2 className="text-lg font-bold mb-2 text-center">Likert Scale Charts</h2>
      <LikertBar
        data={chartsData[currentIndex].data}
        question={chartsData[currentIndex].question}
      />
      <div className="flex justify-center space-x-4 mt-4">
        <button onClick={handlePrev} className="p-2 bg-gray-200 rounded">
          ⬅ Previous
        </button>
        <button onClick={handleNext} className="p-2 bg-gray-200 rounded">
          Next ➡
        </button>
      </div>
      <p className="text-center mt-2">Chart {currentIndex + 1} / {chartsData.length}</p>
    </div>
  );
};

export default LikertChartContainer;
