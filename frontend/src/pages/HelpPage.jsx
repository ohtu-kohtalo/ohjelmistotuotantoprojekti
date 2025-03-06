import React from "react";
import Title from "../components/Title";

const HelpPage = () => {
  return (
    <div className="card">
      <Title className="card-header" text={"Future Customer: A Simulator and Prediction Tool"} />
      <p>
        Something to tell user what the application is and how to use the application
        <br/>
        <br/>
        <br/>
        A quick overview of each selectable 'view':
      </p>
      <ul className="help-list">
        <li><strong>Initial Distribution:</strong> See initial agent pool distribution.</li>
        <li><strong>Add Query:</strong> Ask agents questions and collect their responses.</li>
        <li><strong>Future Distribution:</strong> Model future scenarios and compare them.</li>
      </ul>
      <p>
        Page reacessible at any time, click the <strong>Help Page</strong> button in the sidebar.
      </p>
    </div>
  );
};

export default HelpPage;