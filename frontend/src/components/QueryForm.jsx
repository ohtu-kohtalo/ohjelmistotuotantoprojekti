import React from "react";

const QueryForm = ({ query, setQuery, selectedOption, setSelectedOption, customInput,
  handleSubmit, handleChange, handleCustomInputChange }) => (
  <form onSubmit={handleSubmit} className="form">
    <label htmlFor="query" className="label">
      Company name:
    </label>
    <input
      type="text"
      id="query"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Enter company for data retrieval..."
      className="input"
    />
    <select id="dropdown" value={selectedOption} onChange={handleChange} className="dropdown">
      <option value="">Select...</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
      <option value="other">Other</option>
    </select>
    { selectedOption === "other" && (
      <input
        type="text"
        value={customInput}
        onChange={handleCustomInputChange}
        placeholder="Enter industry"
        className="input"
      />
    )}
    <button type="submit" className="button">
      Submit
    </button>
  </form>
);

export default QueryForm;
