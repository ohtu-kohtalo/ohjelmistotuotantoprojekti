import React, { useState } from "react";

/**
 * Lightweight component for displaying a dismiss-able, inline success message.
 */

const SuccessMessage = ({ message }) => {
  return (
    <div className="success-message">
      <p>{message}</p>
    </div>
  );
};

export default SuccessMessage;
