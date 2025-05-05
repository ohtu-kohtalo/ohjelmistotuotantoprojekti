import React, { useState } from "react";

/**
 * Lightweight component for displaying a dismiss-able, inline error message.
 */

const ErrorMessage = ({ message }) => {
  /** Controls whether the banner is currently shown. */
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // Hide when dismissed

  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
