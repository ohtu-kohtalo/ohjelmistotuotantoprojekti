import React, { useState } from "react";
import ErrorMessage from "./ErrorMessage";

const CsvDownload = ({ questions = {}, fileName = "agent_answers.csv" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use backend URL from env or default to localhost port 5500
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5500";

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      // Send POST request to backend endpoint
      const response = await fetch(`${BACKEND_URL}/download_agent_response_csv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Payload with the questions object.
        body: JSON.stringify({ questions }),
      });

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
      <button onClick={handleDownload} disabled={loading}>
        {loading ? "Downloading..." : "Download CSV"}
      </button>
      {/* If an error occurs, render the ErrorMessage component */}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default CsvDownload;
