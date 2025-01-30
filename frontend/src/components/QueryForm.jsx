import React, { useState } from "react";

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
}) => {
  const [isWebsiteValid, setIsWebsiteValid] = useState(null);

  // Function to validate URL format
  // Current implementation is a (overly) simple check for URL validity
  const isValidUrl = (url) => {
    try {
      if (!url) return null; // If null (empty), no icon is shown
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle website input change and validation
  const handleWebsiteChange = (e) => {
    const value = e.target.value;
    setWebsite(value);
    setIsWebsiteValid(isValidUrl(value));
  };

  // Submit button disabled if selected industry or agent count is empty
  const isSubmitDisabled = selectedOption === "" || agentCount === "";

  return (
    <form onSubmit={handleSubmit} className="form">
      <label htmlFor="query" className="label">
        Company Name
      </label>
      <input
        type="text"
        id="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter company for data retrieval..."
        className="input"
      />

      <label htmlFor="website" className="label input-container">
        Company Website (Optional)
        <div className="input-wrapper">
          <input
            type="text"
            id="website"
            value={website}
            onChange={handleWebsiteChange}
            placeholder="Enter website URL"
            className="input"
          />
          {isWebsiteValid !== null && ( // Show icon only when field is not empty
            <span
              className={`validation-icon ${isWebsiteValid ? "valid" : "invalid"}`}
            >
              {isWebsiteValid ? "✅" : "❌"}
            </span>
          )}
        </div>
      </label>

      <label htmlFor="dropdown" className="label">
        Industry
      </label>
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

      <label htmlFor="agentCount" className="label">
        Number of Agents
      </label>
      <select
        id="agentCount"
        value={agentCount}
        onChange={(e) =>
          setAgentCount(e.target.value ? Number(e.target.value) : "")
        }
        className="dropdown"
      >
        <option value="">Select agent count...</option>
        <option value="1">1 Agent</option>
        <option value="2">2 Agents</option>
        <option value="3">3 Agents</option>
        <option value="4">4 Agents</option>
        <option value="5">5 Agents</option>
      </select>

      <button type="submit" className="button" disabled={isSubmitDisabled}>
        Submit
      </button>
    </form>
  );
};

export default QueryForm;
