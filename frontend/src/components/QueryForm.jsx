import React from "react";

const QueryForm = ({
  company,
  setCompany,
  // industry,
  // setIndustry,
  agentCount,
  setAgentCount,
  handleSubmit,
}) => {
  // Validation checks
  const isCompanyValid = company.trim() !== "";
  // const isIndustryValid = industry.trim() !== "";
  const isSubmitDisabled =
    // !isCompanyValid || !isIndustryValid || agentCount === "";
    !isCompanyValid || agentCount === "";

  return (
    <form onSubmit={handleSubmit} className="form" data-testid="query-form">
      <div className="input-container">
        <label htmlFor="query" className="label">
          Company Name <span className="required-icon">*</span>
        </label>
        <div className="input-wrapper">
          <input
            type="text"
            id="query"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company for context"
            className="input"
          />
          <span
            className={`validation-icon ${isCompanyValid ? "valid" : "invalid"}`}
          >
            {isCompanyValid ? "✅" : "❌"}
          </span>
        </div>
      </div>

      {/* <div className="input-container">
        <label htmlFor="industry" className="label">
          Industry <span className="required-icon">*</span>
        </label>
        <div className="input-wrapper">
          <input
            type="text"
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Enter a description of an industry"
            className="input"
          />
          <span
            className={`validation-icon ${isIndustryValid ? "valid" : "invalid"}`}
          >
            {isIndustryValid ? "✅" : "❌"}
          </span>
        </div>
      </div> */}

      <label htmlFor="agentCount" className="label">
        Number of Agents <span className="required-icon">*</span>
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
        {/* <option value="1">1 Agent</option>
        <option value="2">2 Agents</option>
        <option value="3">3 Agents</option>
        <option value="4">4 Agents</option>
        <option value="5">5 Agents</option> */}
        <option value="15">15 Agents</option>
      </select>

      <button
        type="submit"
        className="button"
        disabled={isSubmitDisabled}
        data-testid="submit-button"
      >
        {isSubmitDisabled ? "🔒 Submit" : "🔓 Submit"}
      </button>
    </form>
  );
};

export default QueryForm;
