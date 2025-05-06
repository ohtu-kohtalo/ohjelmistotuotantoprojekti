import React, { useState } from "react";

/**
 * Lightweight component for displaying a dismiss-able, inline error message.
 */

const ErrorMessage = ({ message }) => {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
