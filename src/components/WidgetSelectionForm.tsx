import React, { useState } from "react";
import "../styles/WidgetSelectionForm.css"; // Import the CSS file for styling

interface WidgetSelectionFormProps {
  onSelect: (chartType: string) => void;
}

const WidgetSelectionForm: React.FC<WidgetSelectionFormProps> = ({ onSelect }) => {
  const [selectedChart, setSelectedChart] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedChart(e.target.value);
    onSelect(e.target.value);
  };

  return (
    <div>
      <h3>Select Widget Type</h3>
      <form className="vertical-form">
        <label>
          <input
            type="radio"
            value="bar"
            checked={selectedChart === "bar"}
            onChange={handleChange}
          />
          Bar Chart
        </label>
        <label>
          <input
            type="radio"
            value="line"
            checked={selectedChart === "line"}
            onChange={handleChange}
          />
          Line Graph
        </label>
        <label>
          <input
            type="radio"
            value="pie"
            checked={selectedChart === "pie"}
            onChange={handleChange}
          />
          Pie Chart
        </label>
        <label>
          <input
            type="radio"
            value="table"
            checked={selectedChart === "table"}
            onChange={handleChange}
          />
          Table
        </label>
      </form>
    </div>
  );
};

export default WidgetSelectionForm;
