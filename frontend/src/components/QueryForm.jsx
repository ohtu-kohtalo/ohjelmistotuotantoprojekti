import React from "react";

const QueryForm = ({
  question,
  setQuestion,
  agentCount,
  setAgentCount,
  handleSubmit,
}) => {
  // Validation checks
  const isQuestionValid = question.trim() !== "";
  const isSubmitDisabled = !isQuestionValid || agentCount === "";

  return (
    <form onSubmit={handleSubmit} className="form" data-testid="query-form">
      <div className="input-container">
        <label htmlFor="query" className="label">
          Question <span className="required-icon">*</span>
        </label>
        <div className="input-wrapper">
          <input
            type="text"
            id="query"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter a question here"
            className="input"
          />
          <span
            className={`validation-icon ${isQuestionValid ? "valid" : "invalid"}`}
          >
            {isQuestionValid ? "✅" : "❌"}
          </span>
        </div>
      </div>

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
