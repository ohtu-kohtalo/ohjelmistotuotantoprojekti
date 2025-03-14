import React, { useState, useRef } from "react";
import Papa from "papaparse";

import ErrorMessage from "./ErrorMessage";

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

        onCsvSuccess?.(`Successfully uploaded "${file.name}".`);

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
    <div>
      <div>
        <input
          data-testid="csv-file-input"
          ref={fileInputRef}
          type="file"
          accept=".csv"
          id="csvFileInput"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <button className="submit-button" onClick={handleButtonClick}>
          Upload
        </button>
      </div>
    </div>
  );
};

export default CsvUpload;
