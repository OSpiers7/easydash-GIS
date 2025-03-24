import React, { useState } from "react";
import "../styles/WidgetSelectionForm.css"; // Import the CSS file for styling

interface WidgetSelectionFormProps {
  onSelect: (chartType: string) => void;
}

const WidgetSelectionForm: React.FC<WidgetSelectionFormProps> = ({ onSelect }) => {
  const [selectedChart, setSelectedChart] = useState<string>("");

  const handleButtonClick = (chartType: string) => {
    setSelectedChart(chartType);
    onSelect(chartType);
  };

  return (
    <div>
      <h3>Select Widget Type</h3>
      <form className="vertical-form">
        <button
          type="button"
          className={`form-button ${selectedChart === "bar" ? "selected" : ""}`}
          onClick={() => handleButtonClick("bar")}
        >
          Bar Chart
        </button>
        <button
          type="button"
          className={`form-button ${selectedChart === "line" ? "selected" : ""}`}
          onClick={() => handleButtonClick("line")}
        >
          Line Graph
        </button>
        <button
          type="button"
          className={`form-button ${selectedChart === "pie" ? "selected" : ""}`}
          onClick={() => handleButtonClick("pie")}
        >
          Pie Chart
        </button>
        <button
          type="button"
          className={`form-button ${selectedChart === "table" ? "selected" : ""}`}
          onClick={() => handleButtonClick("table")}
        >
          Table
        </button>
        <button
          type="button"
          className={`form-button ${selectedChart === "map" ? "selected" : ""}`}
          onClick={() => handleButtonClick("map")}
        >
          Map
        </button>
      </form>
    </div>
  );
};

export default WidgetSelectionForm;
