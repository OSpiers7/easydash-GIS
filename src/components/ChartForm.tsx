import React, { useState } from "react";
import { FeatureCollection } from "geojson";

interface ChartFormProps {
  data: FeatureCollection;
  onSelect: (xAttr: string) => void;
}

const ChartForm: React.FC<ChartFormProps> = ({ data, onSelect }) => {
  const [xAttr, setXAttr] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
if (!xAttr) {
      alert("Please select an attribute for the X-Axis.");
      return;
    }
    onSelect(xAttr); // Only pass xAttr
  };

  const allProperties = new Set<string>();
  data.features.forEach((feature) => {
    Object.keys(feature.properties || {}).forEach((key) => allProperties.add(key));
  });

  return (
    <form onSubmit={handleSubmit}>
      <h3>Configure Chart</h3>
      <label>
        X-Axis Attribute:
        <select value={xAttr} onChange={(e) => setXAttr(e.target.value)}>
          <option value="">Select an attribute</option>
          {[...allProperties].map((prop) => (
            <option key={prop} value={prop}>
              {prop}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Create Chart</button>
    </form>
  );
};

export default ChartForm;
