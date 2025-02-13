import React from "react";

const OptionContainer = ({
  firstOption = "Option 1",
  secondOption = "Option 2",
  thirdOption = "Option 3",
  onSelect,
}) => (
  <div className="option-container">
    <h4 className="option-label">Variables</h4>

    <ul className="option-list">
      {[firstOption, secondOption, thirdOption].map((option, index) => (
        <li key={index} className="option-item">
          <button className="option-button" onClick={() => onSelect(option)}>
            {option}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default OptionContainer;
