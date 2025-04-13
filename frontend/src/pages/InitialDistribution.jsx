import React, { useState } from "react";
import StackedBarChart from "../components/StackedBarChart";

/**
 * Component for displaying initial demographic distributions in a card layout.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} [props.data=[]] - Array of agent data objects. Each object may contain properties such as `age` (number or string) and `gender` (string).
 *
 * @returns {JSX.Element} A card containing demographic distribution charts and summaries.
 *
 * @example
 * const data = [
 *   { age: 25, gender: "male" },
 *   { age: "30", gender: "female" },
 *   { age: 22, gender: "male" }
 * ];
 *
 * <InitialDistribution data={data} />
 */
const InitialDistribution = ({ data = [] }) => {
  const chartType = "bar";
  const [selectedX, setSelectedX] = useState("age");

  // Ensure age is treated as number for calculations
  // Necessary for calculateAverage function
  const cleanAgentData = data.map((agent) => ({
    ...agent,
    age: typeof agent.age === "string" ? parseInt(agent.age, 10) : agent.age,
  }));

  /**
   * Calculates the average of numeric values for a given key in the data array.
   *
   * @param {Array<Object>} data - The array of data objects.
   * @param {string} key - The key whose numeric values will be averaged, in this case agent-objects age.
   * @returns {string|number} The average value rounded to one decimal place, or "N/A" if no valid numbers are found i.e no data is provided / incorrect form of data.
   */
  const calculateAverage = (data, key) => {
    const validValues = data
      .map((d) => d[key])
      .filter((value) => typeof value === "number" && !isNaN(value));

    return validValues.length
      ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1)
      : "N/A";
  };

  /**
   * Computes the distribution of genders in the data array.
   *
   * @param {Array<Object>} data - The array of data objects.
   * @returns {string} A formatted string representing the count of each gender in the format "Gender: Count".
   */
  const getGenderDistribution = (data) => {
    const genderCounts = data.reduce((acc, item) => {
      const gender = item.gender?.toString().trim().toLowerCase();
      if (!gender) return acc;
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(genderCounts)
      .map(([key, value]) => `${key[0].toUpperCase() + key.slice(1)}: ${value}`)
      .join(", ");
  };

  return (
    <div
      id="initialDistribution"
      className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mx-auto"
    >
      <h3 className="text-2xl font-semibold mb-4">Initial demographic distributions</h3>

      <div className="flex gap-4 mb-6">
        <button
          className={`variable-button px-4 py-2 rounded ${
            selectedX === "age" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
          }`}
          onClick={() => setSelectedX("age")}
        >
          Age
        </button>
        <button
          className={`variable-button px-4 py-2 rounded ${
            selectedX === "gender" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
          }`}
          onClick={() => setSelectedX("gender")}
        >
          Gender
        </button>
      </div>

      <div className="w-full mb-6">
        {cleanAgentData.length === 0 ? (
          <div className="w-full min-h-[300px] bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 text-lg">[Graph placeholder]</p>
          </div>
        ) : (
          chartType === "bar" && (
            <div className="w-full overflow-x-auto">
              <StackedBarChart data={cleanAgentData} xAxis={selectedX} />
            </div>
          )
        )}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="text-xl font-semibold mb-2">Data Summary</h4>
        <p>
          <strong>Total Entries:</strong> {cleanAgentData.length}
        </p>
        <p>
          <strong>Average Age:</strong> {calculateAverage(cleanAgentData, "age")}
        </p>
        <p>
          <strong>Gender Distribution:</strong> {getGenderDistribution(cleanAgentData)}
        </p>
      </div>
    </div>
  );
};

export default InitialDistribution;
