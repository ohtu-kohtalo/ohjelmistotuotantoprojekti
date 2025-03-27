import React, { useState } from "react";

const ErrorMessage = ({ message }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // Hide when dismissed

  return (
    <div className="error-message">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
