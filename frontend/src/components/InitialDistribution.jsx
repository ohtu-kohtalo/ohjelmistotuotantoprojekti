import React, { useState } from "react";
import StackedBarChart from "./StackedBarChart";

/** Initial demographic card */
const InitialDistribution = ({ data = [] }) => {
  const [selectedX, setSelectedX] = useState("age");
  const chartType = "bar";

  /* ---------- helpers ---------- */
  const clean = data.map((a) => ({
    ...a,
    age: typeof a.age === "string" ? parseInt(a.age, 10) : a.age,
  }));

  const avg = (arr, key) => {
    const nums = arr.map((d) => d[key]).filter((n) => typeof n === "number");
    return nums.length
      ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
      : "N/A";
  };

  const genders = (arr) =>
    Object.entries(
      arr.reduce((acc, { gender }) => {
        const g = gender?.toString().trim().toLowerCase();
        if (!g) return acc;
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {}),
    )
      .map(([g, n]) => `${g[0].toUpperCase() + g.slice(1)}: ${n}`)
      .join(", ");
  /* ------------------------------ */

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 w-full">
      {/* header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* left : title + buttons */}
        <div className="flex flex-col gap-4">
          {/* grows at lg (≈1024) then 2xl (≈1536) – nothing at xl */}
          <h3 className="font-semibold text-lg lg:text-xl 2xl:text-3xl">
            Initial demographic distributions
          </h3>

          <div className="flex gap-4">
            {["age", "gender"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedX(f)}
                className={`variable-button px-4 py-2 rounded ${
                  selectedX === f
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* right : summary text – tiny, bumps at lg and again at 2xl */}
        <div className="leading-relaxed space-y-1 text-[10px] md:text-xs lg:text-sm 2xl:text-base text-gray-200 md:text-right">
          <p>
            <strong>Total&nbsp;Entries:</strong>&nbsp;{clean.length}
          </p>
          <p>
            <strong>Average&nbsp;Age:</strong>&nbsp;{avg(clean, "age")}
          </p>
          <p>
            <strong>Gender&nbsp;Distribution:</strong>&nbsp;{genders(clean)}
          </p>
        </div>
      </div>

      {/* chart */}
      <div className="w-full lg:max-w-[70vw] xl:max-w-[75vw] 2xl:max-w-[80vw] mb-6">
        {clean.length === 0 ? (
          <div className="w-full min-h-[300px] bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 text-lg">[Graph placeholder]</p>
          </div>
        ) : (
          chartType === "bar" && (
            <div className="w-full overflow-x-auto">
              <StackedBarChart data={clean} xAxis={selectedX} />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default InitialDistribution;
