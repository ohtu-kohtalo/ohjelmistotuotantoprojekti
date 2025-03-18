import React from "react";

const HelpPage = () => {
  return (
    <div id="helpPage" className="card active">
      <h3 className="card-header">
        Future Consumer: A Simulator and Prediction Tool
      </h3>
      <p>
        This is a software development project for VTT by a team on students at
        Helsinki University. The program is currently in active development.
      </p>
      <p>
        The program can be used to help predict consumer behaviour by creating
        agents based on historical data and by simulating their answers to query
        questions with the help of LLM. The current functionality allows the
        user to ask questions from the agents and the program returns a likert
        scale chart of the answers. The user can also export a CSV file of the
        agents answers for later analysis.
      </p>
      <p>A quick overview of each selectable view:</p>
      <ul className="help-list">
        <li>
          <strong>Initial Distribution:</strong> See the demographic
          distributions of the agents based on the training data.
        </li>
        <li>
          <strong>Add Query:</strong> Ask agents questions and collect their
          responses.
        </li>
      </ul>
    </div>
  );
};

export default HelpPage;
