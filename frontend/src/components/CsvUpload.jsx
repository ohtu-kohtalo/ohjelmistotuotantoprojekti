/**
 * @file CsvUpload.jsx
 *
 * React component that lets a user pick a **header-less** CSV file,
 * validates each row (exactly one column, non-empty after trimming),
 * and then passes the parsed questions array upstream.
 *
 * The component:
 * 1. A hidden `<input type="file">` is triggered by an **Upload CSV** button.
 * 2. The selected file is parsed with **Papa Parse**:
 *    - `header: false` ensures we read raw rows.
 *    - `skipEmptyLines: true` ignores blank lines.
 * 3. Every row is validated:
 *    - Must contain exactly one column.
 *    - That column must not be only whitespace.
 * 4. On success, the component:
 *    - Updates internal state (`fileName`, `questions`).
 *    - Calls `onCsvSuccess` with a friendly message.
 *    - Calls `handleCsvSubmit(questions)` so the parent can proceed.
 * 5. On any error, the component:
 *    - Clears local state and file input.
 *    - Calls `onCsvError` with a descriptive message.
 *
 * @module CsvUpload
 */

import React, { useState, useRef } from "react";
import Papa from "papaparse";

/**
 * Upload button + hidden file input for question CSVs.
 *
 * @param {Object}   props
 * @param {function} [props.onCsvError]      – Callback fired with `(message)` when validation/parsing fails.
 * @param {function} [props.onCsvSuccess]    – Callback fired with `(message)` when parsing succeeds.
 * @param {function} props.handleCsvSubmit   – **Required.** Receives the parsed `questions` array on success.
 *
 * @returns {JSX.Element}
 */
const CsvUpload = ({ onCsvError, onCsvSuccess, handleCsvSubmit }) => {
  const [fileName, setFileName] = useState("");
  const [questions, setQuestions] = useState([]);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setQuestions([]);

    // Only accept CSV files with no header, one question per row
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const { data } = results;

        // Check for empty CSV file
        if (!data || data.length === 0) {
          onCsvError?.("CSV is empty");
          setFileName("");
          event.target.value = null;
          return;
        }

        // Check that each row has one column
        const questions = [];
        for (let i = 0; i < data.length; i++) {
          const row = data[i];

          if (row.length !== 1) {
            onCsvError?.(
              `Row ${i + 1} can only contain one column. Found ${row.length}.`,
            );
            setFileName("");
            event.target.value = null;
            return;
          }

          // Check for row containing only spaces
          const question = row[0].trim();
          if (!question) {
            onCsvError?.(`Row ${i + 1} contains only spaces`);
            setFileName("");
            event.target.value = null;
            return;
          }
          questions.push(question);
        }

        setFileName(file.name);
        setQuestions(questions);
        event.target.value = null;

        onCsvSuccess?.(`Successfully uploaded "${file.name}". 💡`);

        handleCsvSubmit(questions);
      },
      error: (error) => {
        // General purpose error
        onCsvError?.(`CSV parsing error: ${error.message}`);
        setFileName("");
        event.target.value = null;
      },
    });
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        id="csvFileInput"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={handleButtonClick}
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
        Upload CSV
      </button>
    </>
  );
};

export default CsvUpload;
