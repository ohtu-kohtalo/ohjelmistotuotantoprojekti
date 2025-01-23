import React from "react";

const QueryForm = ({ query, setQuery, handleSubmit }) => (
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
    <button type="submit" className="button">
      Submit
    </button>
  </form>
);

export default QueryForm;
