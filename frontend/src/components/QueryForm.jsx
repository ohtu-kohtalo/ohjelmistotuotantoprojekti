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
  // Current implementation checks for URL validity
  const isValidUrl = (url) => {
    if (!url) return null;

    try {
      let parsedUrl = new URL(url);

      // Ensure protocol is HTTP or HTTPS
      if (!/^https?:$/.test(parsedUrl.protocol)) {
        return false;
      }

      // Check if hostname starts with 'www.'
      if (!parsedUrl.hostname.startsWith("www.")) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  };

  // Handle website input change and validation
  const handleWebsiteChange = (e) => {
    const value = e.target.value;
    setWebsite(value);
    setIsWebsiteValid(isValidUrl(value));
  };

  // Submit button disabled if no agent count is selected or website format is invalid
  const isSubmitDisabled = agentCount === "" || isWebsiteValid === false;

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
        <p>
          <em>https://www.example.com</em>
        </p>
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
      <input
        type="text"
        value={customInput}
        onChange={handleCustomInputChange}
        placeholder="Enter a description of an industry"
        className="input"
      />
      {/*       
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
 */}
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
        required
      >
        <option value="" disabled hidden>
          Select agent count...
        </option>
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
