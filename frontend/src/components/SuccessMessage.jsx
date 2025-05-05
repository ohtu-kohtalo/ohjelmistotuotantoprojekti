import React, { useState } from "react";

/**
 * Lightweight component for displaying a dismiss-able, inline success message.
 */

const SuccessMessage = ({ message }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // Hide when dismissed

  return (
    <div className="success-message">
      <p>{message}</p>
    </div>
  );
};

export default SuccessMessage;
