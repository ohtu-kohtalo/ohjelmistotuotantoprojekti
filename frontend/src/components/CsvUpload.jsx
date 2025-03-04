import React, { useState, useRef } from "react";

const CsvUpload = () => {
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Upload CSV File</button>
      <p>{fileName}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CsvUpload;
