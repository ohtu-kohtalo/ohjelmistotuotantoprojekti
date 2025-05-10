/**
 * @file CsvDownload.jsx
 *
 * React component that triggers a CSV download from the backend.
 * It packages two question-object payloads (`questions` and `future_questions`)
 * into a POST request and streams the resulting CSV file to the user.
 *
 * The component:
 * 1. Locates the backend URL from an environment variable (or defaults to localhost).
 * 2. Sends the payload in JSON format.
 * 3. Receives a Blob and converts it into a client-side download.
 * 4. Handles loading / error UI state.
 *
 * @module CsvDownload
 */

import React, { useState } from "react";
import ErrorMessage from "./ErrorMessage";

/**
 * Download button for CSV export of agent answers.
 *
 * @param {Object}   props
 * @param {Object}   props.questions          – Already-answered questions keyed by ID.
 * @param {Object}   props.future_questions   – Future / follow-up questions keyed by ID.
 * @param {string}   [props.fileName]         – Default filename if the backend does not supply one.
 * @param {boolean}  [props.disabled]         – Optional flag to disable the button.
 * @returns {JSX.Element}
 */
const CsvDownload = ({
  questions = {},
  future_questions = {},
  fileName = "agent_answers.csv",
  disabled,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use backend URL from env or default to localhost port 5500
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";

  /**
   * Handles the download of a CSV file by sending a POST request to the backend
   * and triggering a file download in the browser.
   *
   * @async
   * @function handleDownload
   * @returns {Promise<void>} Resolves when the download process is complete.
   *
   * @throws {Error} Throws an error if the download fails or the response is invalid.
   *
   * @description
   * - Sends a POST request to the backend endpoint with the provided questions and future_questions as payload.
   * - Handles errors from the backend response and displays an appropriate error message.
   * - Extracts the filename from the "Content-Disposition" header if available, or falls back to a default filename.
   * - Creates a Blob from the response, generates a temporary object URL, and triggers the download.
   *
   * @example
   * // Example usage:
   * handleDownload()
   *   .then(() => console.log("Download successful"))
   *   .catch((error) => console.error("Download failed:", error));
   */
  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      // Send POST request to backend endpoint
      const response = await fetch(
        `${BACKEND_URL}/download_agent_response_csv`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Payload with the question objects
          body: JSON.stringify({ questions, future_questions }),
        },
      );

      // Check for response errors
      if (!response.ok) {
        let errorMsg = "Error downloading CSV";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          }
        } catch (parseError) {
          // Default error message
        }
        throw new Error(errorMsg);
      }

      // Convert response to Blob
      const blob = await response.blob();
      // Create object URL based on Blob
      const url = window.URL.createObjectURL(blob);
      // Temporary anchor element
      const a = document.createElement("a");
      a.href = url;

      // Try to extract the filename from the response header
      const disposition = response.headers.get("Content-Disposition");
      if (disposition) {
        // Matches strings in the form filename="{something}" or filename={something}
        const filenameRegex = /filename="?([^"]+)"?/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[1]) {
          a.download = matches[1]; // Use filename provided by backend
        } else {
          a.download = fileName; // Use fileName prop
        }
      } else {
        a.download = fileName; // If Content-Disposition header isn't found
      }

      // Append temporary anchor to document and trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading || disabled}
        className="
          px-3
          py-1.5
          text-white
          bg-blue-600
          hover:bg-blue-700
          rounded-md
          font-medium
          transform
          transition-all
          duration-1000
          hover:scale-105
          cursor-pointer
        "
      >
        {loading ? "Downloading..." : "Download CSV"}
      </button>
      {/* If an error occurs, render the ErrorMessage component */}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default CsvDownload;
