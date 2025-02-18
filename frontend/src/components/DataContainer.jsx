import React from "react";

// SUBJECT TO CHANGE DEPENDING ON THE INCOMING DATA STRUCTURE
// CURRENT SOLUTION ONLY HANDLES SAMPLE DATA
const DataContainer = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="data-container">No data available</div>;
  }

  const totalEntries = data.length;
  const numericFields = Object.keys(data[0]).filter(
    (key) => typeof data[0][key] === "number"
  );

  const averages = numericFields.reduce((acc, field) => {
    acc[field] =
      data.reduce((sum, item) => sum + item[field], 0) / totalEntries;
    return acc;
  }, {});

  return (
    <div className="data-container">
      <h4 className="data-title">Dataset Overview</h4>
      <p>Total Entries: {totalEntries}</p>
      <ul className="data-summary">
        {Object.entries(averages).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataContainer;
