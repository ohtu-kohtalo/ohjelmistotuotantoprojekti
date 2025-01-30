import React from "react";

const QueryForm = ({
  query,
  setQuery,
  selectedOption,
  setSelectedOption,
  customInput,
  handleSubmit,
  handleChange,
  handleCustomInputChange,
  website,
  setWebsite,
  agentCount,
  setAgentCount,
}) => (
  <form onSubmit={handleSubmit} className="form">
    <label htmlFor="query" className="label"></label>
    <input
      type="text"
      id="query"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Enter company for data retrieval..."
      className="input"
    />
    <input
      type="text"
      id="website"
      value={website}
      onChange={(e) => setWebsite(e.target.value)}
      placeholder="Set company's website (optional)"
      className="input"
    />
    <select
      id="dropdown"
      value={selectedOption}
      onChange={handleChange}
      className="dropdown"
    >
      <option value="">Select industry...</option>
      <option value="option1">Industry Option 1</option>
      <option value="option2">Industry Option 2</option>
      <option value="option3">Industry Option 3</option>
      <option value="other">Other</option>
    </select>
    {selectedOption === "other" && (
      <input
        type="text"
        value={customInput}
        onChange={handleCustomInputChange}
        placeholder="Enter industry"
        className="input"
      />
    )}
    <select
      id="agentCount"
      value={agentCount}
      onChange={(e) => setAgentCount(Number(e.target.value))}
      className="dropdown"
    >
      <option value="">Select agent count...</option>
      <option value="1">1 Agent</option>
      <option value="2">2 Agents</option>
      <option value="3">3 Agents</option>
      <option value="4">4 Agents</option>
      <option value="5">5 Agents</option>
    </select>
    <button type="submit" className="button">
      Submit
    </button>
  </form>
);

export default QueryForm;
